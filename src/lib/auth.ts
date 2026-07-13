import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AccessRole = "admin" | "teacher";
export type AccessStatus = "pending" | "approved" | "suspended";

export const getCurrentAccount = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: access }, { data: profile }] = await Promise.all([
    supabase.from("user_access").select("role,status,email").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("display_name,username,school_name,bio,is_public").eq("id", user.id).maybeSingle(),
  ]);

  return { user, access, profile };
});

export async function requireApprovedUser() {
  const account = await getCurrentAccount();
  if (!account) redirect("/login");
  if (account.access?.status === "pending") redirect("/pending");
  if (account.access?.status !== "approved") redirect("/login?error=suspended");
  return account;
}

export async function requireAdmin() {
  const account = await requireApprovedUser();
  if (account.access?.role !== "admin") redirect("/dashboard");
  return account;
}
