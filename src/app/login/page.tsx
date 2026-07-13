import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { getCurrentAccount } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; password?: string }> }) {
  const [account, query] = await Promise.all([getCurrentAccount(), searchParams]);
  if (account?.access?.status === "approved") redirect("/dashboard");
  const message = query.error === "suspended" ? "บัญชีนี้ถูกระงับ กรุณาติดต่อผู้ดูแลระบบ" : query.password === "updated" ? "ตั้งรหัสผ่านใหม่สำเร็จ กรุณาเข้าสู่ระบบ" : undefined;
  return <AuthShell title="เข้าสู่ระบบครู" description="เข้าสู่ระบบเพื่อจัดการชุดคำและเปิดเกมจากอุปกรณ์ใดก็ได้"><AuthForm mode="login" initialMessage={message} /></AuthShell>;
}
