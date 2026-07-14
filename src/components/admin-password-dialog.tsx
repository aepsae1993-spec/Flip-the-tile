"use client";

import { useActionState, useState } from "react";
import { KeyRound, LoaderCircle } from "lucide-react";
import { setUserPasswordAction, type AdminPasswordState } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminPasswordDialog({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<AdminPasswordState, FormData>(setUserPasswordAction, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost"><KeyRound className="mr-1 size-4" />เปลี่ยนรหัส</Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action}>
          <input type="hidden" name="user_id" value={userId} />
          <DialogHeader>
            <DialogTitle>เปลี่ยนรหัสผ่านผู้ใช้</DialogTitle>
            <DialogDescription>กำหนดรหัสผ่านใหม่ให้ {userName} โดยไม่ต้องส่งอีเมลรีเซ็ต</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-5">
            <div className="space-y-2">
              <Label htmlFor={`password-${userId}`}>รหัสผ่านใหม่</Label>
              <Input id={`password-${userId}`} name="password" type="password" minLength={8} maxLength={128} autoComplete="new-password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`confirm-password-${userId}`}>ยืนยันรหัสผ่านใหม่</Label>
              <Input id={`confirm-password-${userId}`} name="confirm_password" type="password" minLength={8} maxLength={128} autoComplete="new-password" required />
            </div>
            {state?.error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>}
            {state?.success && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{state.success}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>ปิด</Button>
            <Button type="submit" disabled={pending}>
              {pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <KeyRound className="mr-2 size-4" />}
              บันทึกรหัสผ่านใหม่
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
