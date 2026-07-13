"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function setUserStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!userId || !["approved", "pending", "suspended"].includes(status)) return;
  if (userId === admin.user.id && status !== "approved") return;
  const supabase = await createClient();
  await supabase.from("user_access").update({ status, approved_at: status === "approved" ? new Date().toISOString() : null, approved_by: status === "approved" ? admin.user.id : null, updated_at: new Date().toISOString() }).eq("user_id", userId);
  revalidatePath("/admin/users");
}

export async function sendPasswordResetAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const supabase = await createClient();
  const { data } = await supabase.from("user_access").select("email").eq("user_id", userId).maybeSingle();
  if (data?.email) {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "flip-the-tile-kappa.vercel.app";
    const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
    await supabase.auth.resetPasswordForEmail(data.email, { redirectTo: `${protocol}://${host}/auth/update-password` });
  }
  redirect("/admin/users?reset=sent");
}
