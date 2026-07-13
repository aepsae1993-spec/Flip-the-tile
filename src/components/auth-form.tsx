"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPasswordAction,
  loginAction,
  signupAction,
  updatePasswordAction,
  type AuthState,
} from "@/app/auth/actions";

type Mode = "login" | "signup" | "forgot" | "update";

const actions = { login: loginAction, signup: signupAction, forgot: forgotPasswordAction, update: updatePasswordAction };

export function AuthForm({ mode, initialMessage }: { mode: Mode; initialMessage?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(actions[mode], undefined);
  const isPasswordForm = mode === "login" || mode === "signup" || mode === "update";

  return (
    <form action={action} className="space-y-4">
      {mode === "signup" && (
        <>
          <div className="space-y-2"><Label htmlFor="display_name">ชื่อที่แสดง</Label><Input id="display_name" name="display_name" placeholder="เช่น ครูดิส" required /></div>
          <div className="space-y-2"><Label htmlFor="username">ชื่อโปรไฟล์</Label><Input id="username" name="username" placeholder="kru-dis" autoCapitalize="none" required /><p className="text-xs text-muted-foreground">ใช้สำหรับลิงก์โปรไฟล์ รองรับตัวอักษรอังกฤษ ตัวเลข _ และ -</p></div>
          <div className="space-y-2"><Label htmlFor="school_name">โรงเรียน (ไม่บังคับ)</Label><Input id="school_name" name="school_name" /></div>
        </>
      )}

      {mode !== "update" && <div className="space-y-2"><Label htmlFor="email">อีเมล</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>}
      {isPasswordForm && <div className="space-y-2"><Label htmlFor="password">{mode === "update" ? "รหัสผ่านใหม่" : "รหัสผ่าน"}</Label><Input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required /></div>}
      {(mode === "signup" || mode === "update") && <div className="space-y-2"><Label htmlFor="confirm_password">ยืนยันรหัสผ่าน</Label><Input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" minLength={8} required /></div>}

      {(state?.error || initialMessage) && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state?.error ?? initialMessage}</p>}
      {state?.success && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>}

      <Button type="submit" className="h-11 w-full" disabled={pending}>
        {pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <ArrowRight className="mr-2 size-4" />}
        {mode === "login" ? "เข้าสู่ระบบ" : mode === "signup" ? "สมัครสมาชิก" : mode === "forgot" ? "ส่งลิงก์รีเซ็ต" : "บันทึกรหัสผ่านใหม่"}
      </Button>

      {mode === "login" && <div className="flex justify-between text-sm"><Link className="text-primary hover:underline" href="/forgot-password">ลืมรหัสผ่าน?</Link><Link className="text-primary hover:underline" href="/register">สมัครสมาชิก</Link></div>}
      {mode === "signup" && <p className="text-center text-sm text-muted-foreground">มีบัญชีแล้ว? <Link className="text-primary hover:underline" href="/login">เข้าสู่ระบบ</Link></p>}
      {mode === "forgot" && <p className="text-center text-sm"><Link className="text-primary hover:underline" href="/login">กลับหน้าเข้าสู่ระบบ</Link></p>}
    </form>
  );
}
