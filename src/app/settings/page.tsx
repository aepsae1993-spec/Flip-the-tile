import Link from "next/link";
import { ChevronLeft, KeyRound, Save } from "lucide-react";
import { changePasswordAction, updateProfileAction } from "@/app/settings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireApprovedUser } from "@/lib/auth";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; password?: string }> }) {
  const [account, query] = await Promise.all([requireApprovedUser(), searchParams]);
  return (
    <main className="min-h-screen bg-muted/35">
      <header className="border-b bg-background"><div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6"><h1 className="font-semibold">ตั้งค่าบัญชี</h1><Button asChild variant="ghost"><Link href="/dashboard"><ChevronLeft className="mr-1 size-4" />แดชบอร์ด</Link></Button></div></header>
      <div className="mx-auto grid max-w-4xl gap-6 px-4 py-8 sm:px-6">
        {query.saved && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">บันทึกโปรไฟล์แล้ว</p>}
        {query.password && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">รหัสผ่านไม่ตรงกันหรือบันทึกไม่สำเร็จ</p>}
        <Card><CardHeader><CardTitle>โปรไฟล์ครู</CardTitle></CardHeader><CardContent><form action={updateProfileAction} className="space-y-4"><div className="space-y-2"><Label htmlFor="display_name">ชื่อที่แสดง</Label><Input id="display_name" name="display_name" defaultValue={account.profile?.display_name ?? ""} required /></div><div className="space-y-2"><Label htmlFor="school_name">โรงเรียน</Label><Input id="school_name" name="school_name" defaultValue={account.profile?.school_name ?? ""} /></div><div className="space-y-2"><Label htmlFor="bio">แนะนำตัว</Label><Textarea id="bio" name="bio" defaultValue={account.profile?.bio ?? ""} /></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_public" defaultChecked={account.profile?.is_public ?? true} /> แสดงโปรไฟล์และชุดคำสาธารณะ</label><Button type="submit"><Save className="mr-2 size-4" />บันทึกโปรไฟล์</Button></form></CardContent></Card>
        <Card><CardHeader><CardTitle>เปลี่ยนรหัสผ่าน</CardTitle></CardHeader><CardContent><form action={changePasswordAction} className="space-y-4"><div className="space-y-2"><Label htmlFor="password">รหัสผ่านใหม่</Label><Input id="password" name="password" type="password" minLength={8} required /></div><div className="space-y-2"><Label htmlFor="confirm_password">ยืนยันรหัสผ่านใหม่</Label><Input id="confirm_password" name="confirm_password" type="password" minLength={8} required /></div><Button type="submit" variant="outline"><KeyRound className="mr-2 size-4" />เปลี่ยนรหัสผ่าน</Button></form></CardContent></Card>
      </div>
    </main>
  );
}
