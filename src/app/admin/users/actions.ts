"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type AdminPasswordState = { error?: string; success?: string } | undefined;

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

export async function setUserPasswordAction(_state: AdminPasswordState, formData: FormData): Promise<AdminPasswordState> {
  await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");
  if (!userId) return { error: "ไม่พบผู้ใช้" };
  if (password.length < 8 || password.length > 128) return { error: "รหัสผ่านต้องมี 8–128 ตัวอักษร" };
  if (password !== confirmPassword) return { error: "รหัสผ่านทั้งสองช่องไม่ตรงกัน" };

  const supabase = await createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) return { error: "เซสชันแอดมินหมดอายุ กรุณาเข้าสู่ระบบใหม่" };

  const { error } = await supabase.functions.invoke("admin-set-password", {
    body: { userId, password },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) return { error: "เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่" };
  return { success: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว ผู้ใช้สามารถใช้รหัสใหม่เข้าสู่ระบบได้ทันที" };
}
