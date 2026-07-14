import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.110.2";

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

function response(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

async function hash(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return response(405, { code: "METHOD_NOT_ALLOWED" });
  if (Number(request.headers.get("content-length") ?? 0) > 8192) return response(413, { code: "PAYLOAD_TOO_LARGE" });

  try {
    const body = await request.json();
    const displayName = String(body.displayName ?? "").trim();
    const username = String(body.username ?? "").trim().toLowerCase();
    const schoolName = String(body.schoolName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (displayName.length < 2 || displayName.length > 100) return response(400, { code: "INVALID_DISPLAY_NAME" });
    if (!/^[a-z0-9_-]{3,40}$/.test(username)) return response(400, { code: "INVALID_USERNAME" });
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) return response(400, { code: "INVALID_EMAIL" });
    if (password.length < 8 || password.length > 128) return response(400, { code: "INVALID_PASSWORD" });
    if (schoolName.length > 160) return response(400, { code: "INVALID_SCHOOL_NAME" });

    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) throw new Error("Missing Supabase function environment");
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")?.trim();
    const emailKey = await hash(`email:${email}`);
    const { data: emailAllowed, error: emailLimitError } = await admin.rpc("consume_registration_attempt", {
      p_key_hash: emailKey,
      p_max_attempts: 3,
    });
    if (emailLimitError) throw emailLimitError;

    let ipAllowed = true;
    if (forwardedFor) {
      const { data, error } = await admin.rpc("consume_registration_attempt", {
        p_key_hash: await hash(`ip:${forwardedFor}`),
        p_max_attempts: 8,
      });
      if (error) throw error;
      ipAllowed = data === true;
    }
    if (!emailAllowed || !ipAllowed) return response(429, { code: "RATE_LIMIT" });

    const [{ data: existingAccess }, { data: existingProfile }] = await Promise.all([
      admin.from("user_access").select("user_id").eq("email", email).maybeSingle(),
      admin.from("profiles").select("id").eq("username", username).maybeSingle(),
    ]);
    if (existingAccess || existingProfile) return response(409, { code: "DUPLICATE_ACCOUNT" });

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName, username, school_name: schoolName },
    });
    if (error || !data.user) {
      console.error("[register-user] create failed", { code: error?.code, status: error?.status });
      if (error?.message.toLowerCase().includes("already")) return response(409, { code: "DUPLICATE_ACCOUNT" });
      return response(400, { code: "CREATE_FAILED" });
    }

    console.log("[register-user] created", { userId: data.user.id });
    return response(201, { success: true });
  } catch (error) {
    console.error("[register-user] unexpected error", { error: String(error) });
    return response(500, { code: "INTERNAL_ERROR" });
  }
});
