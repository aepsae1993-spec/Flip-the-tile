import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function RegisterPage() {
  return <AuthShell title="สมัครบัญชีครู" description="สร้างโปรไฟล์ครู เมื่อยืนยันอีเมลและแอดมินอนุมัติแล้วจึงเริ่มสร้างชุดคำได้"><AuthForm mode="signup" /></AuthShell>;
}
