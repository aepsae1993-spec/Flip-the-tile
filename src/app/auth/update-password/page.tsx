import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function UpdatePasswordPage() {
  return <AuthShell title="ตั้งรหัสผ่านใหม่" description="ตั้งรหัสผ่านใหม่อย่างน้อย 8 ตัวอักษร"><AuthForm mode="update" /></AuthShell>;
}
