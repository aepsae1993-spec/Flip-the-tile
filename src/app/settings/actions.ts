"use server";

import { redirect } from "next/navigation";
import { requireApprovedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileAction(formData: FormData) {
  const account = await requireApprovedUser();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const schoolName = String(formData.get("school_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const isPublic = formData.get("is_public") === "on";
  if (displayName.length < 2 || displayName.length > 80) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ display_name: displayName, school_name: schoolName || null, bio: bio || null, is_public: isPublic, updated_at: new Date().toISOString() }).eq("id", account.user.id);
  redirect("/settings?saved=1");
}

export async function changePasswordAction(formData: FormData) {
  await requireApprovedUser();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");
  if (password.length < 8 || password !== confirmPassword) redirect("/settings?password=invalid");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/settings?password=error");
  await supabase.auth.signOut();
  redirect("/login?password=updated");
}
