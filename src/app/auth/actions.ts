"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; success?: string } | undefined;

async function getOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  return host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL ?? "https://flip-the-tile-kappa.vercel.app");
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  if (!email || !password) return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };

  const { data: access } = await supabase
    .from("user_access")
    .select("status")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (access?.status === "pending") redirect("/pending");
  if (access?.status === "suspended") {
    await supabase.auth.signOut();
    return { error: "บัญชีนี้ถูกระงับ กรุณาติดต่อผู้ดูแลระบบ" };
  }
  if (access?.status !== "approved") return { error: "ไม่พบสิทธิ์เข้าใช้งานของบัญชีนี้" };
  redirect("/dashboard");
}

export async function signupAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const displayName = text(formData, "display_name");
  const username = text(formData, "username").toLowerCase();
  const schoolName = text(formData, "school_name");
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  const confirmPassword = text(formData, "confirm_password");

  if (displayName.length < 2) return { error: "ชื่อที่แสดงต้องมีอย่างน้อย 2 ตัวอักษร" };
  if (!/^[a-z0-9_-]{3,40}$/.test(username)) return { error: "ชื่อโปรไฟล์ใช้ a-z, 0-9, _ หรือ - จำนวน 3–40 ตัว" };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "รูปแบบอีเมลไม่ถูกต้อง" };
  if (password.length < 8) return { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
  if (password !== confirmPassword) return { error: "รหัสผ่านทั้งสองช่องไม่ตรงกัน" };

  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/pending`,
      data: { display_name: displayName, username, school_name: schoolName },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) return { error: "อีเมลหรือชื่อโปรไฟล์นี้ถูกใช้งานแล้ว" };
    return { error: "สมัครสมาชิกไม่สำเร็จ กรุณาตรวจข้อมูลแล้วลองใหม่" };
  }

  if (data.session && email === "aepsae1993@gmail.com") redirect("/dashboard");
  redirect(`/pending?email=${encodeURIComponent(email)}`);
}

export async function forgotPasswordAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email").toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "กรุณากรอกอีเมลให้ถูกต้อง" };
  const supabase = await createClient();
  const origin = await getOrigin();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/update-password` });
  return { success: "หากอีเมลนี้มีบัญชีอยู่ ระบบได้ส่งลิงก์ตั้งรหัสผ่านใหม่แล้ว" };
}

export async function updatePasswordAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const password = text(formData, "password");
  const confirmPassword = text(formData, "confirm_password");
  if (password.length < 8) return { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
  if (password !== confirmPassword) return { error: "รหัสผ่านทั้งสองช่องไม่ตรงกัน" };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "ลิงก์หมดอายุหรือไม่พบ session กรุณาขอลิงก์ใหม่" };
  redirect("/login?password=updated");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
