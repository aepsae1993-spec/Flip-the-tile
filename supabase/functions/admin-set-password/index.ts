import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.110.2";

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

function response(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return response(405, { code: "METHOD_NOT_ALLOWED" });

  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return response(401, { code: "UNAUTHORIZED" });

    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) throw new Error("Missing Supabase function environment");
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) return response(401, { code: "UNAUTHORIZED" });

    const { data: access } = await admin
      .from("user_access")
      .select("role,status")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (access?.role !== "admin" || access.status !== "approved") return response(403, { code: "FORBIDDEN" });

    const body = await request.json();
    const userId = String(body.userId ?? "").trim();
    const password = String(body.password ?? "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
      return response(400, { code: "INVALID_USER" });
    }
    if (password.length < 8 || password.length > 128) return response(400, { code: "INVALID_PASSWORD" });

    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) {
      console.error("[admin-set-password] update failed", { adminId: userData.user.id, userId, status: error.status });
      return response(400, { code: "UPDATE_FAILED" });
    }

    console.log("[admin-set-password] updated", { adminId: userData.user.id, userId });
    return response(200, { success: true });
  } catch (error) {
    console.error("[admin-set-password] unexpected error", { error: String(error) });
    return response(500, { code: "INTERNAL_ERROR" });
  }
});
