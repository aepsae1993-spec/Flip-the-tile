import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function ForgotPasswordPage() {
  return <AuthShell title="ลืมรหัสผ่าน" description="กรอกอีเมลที่สมัครไว้ ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่"><AuthForm mode="forgot" /></AuthShell>;
}
