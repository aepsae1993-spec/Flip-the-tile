import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function RegisterPage() {
  return <AuthShell title="สมัครบัญชีครู" description="สร้างโปรไฟล์ครู แล้วรอแอดมินอนุมัติเพื่อเริ่มสร้างชุดคำ"><AuthForm mode="signup" /></AuthShell>;
}
