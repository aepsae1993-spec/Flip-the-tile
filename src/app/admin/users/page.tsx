import Link from "next/link";
import { CheckCircle2, ChevronLeft, Mail, ShieldCheck, UserX } from "lucide-react";
import { sendPasswordResetAction, setUserStatusAction } from "@/app/admin/users/actions";
import { AdminPasswordDialog } from "@/components/admin-password-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const [admin, query] = await Promise.all([requireAdmin(), searchParams]);
  const supabase = await createClient();
  const [{ data: accessRows }, { data: profiles }] = await Promise.all([
    supabase.from("user_access").select("user_id,email,role,status,created_at").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id,display_name,username,school_name"),
  ]);
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const pending = accessRows?.filter((row) => row.status === "pending").length ?? 0;

  return (
    <main className="min-h-screen bg-muted/35">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="size-5 text-primary" />ผู้ดูแลระบบ</div>
          <Button asChild variant="ghost"><Link href="/dashboard"><ChevronLeft className="mr-1 size-4" />แดชบอร์ด</Link></Button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-end justify-between">
          <div><h1 className="text-3xl font-bold">จัดการผู้ใช้</h1><p className="mt-2 text-muted-foreground">อนุมัติ ระงับ ส่งลิงก์รีเซ็ต และกำหนดรหัสผ่านใหม่ให้ผู้ใช้</p></div>
          <Badge className="px-3 py-1.5">รออนุมัติ {pending}</Badge>
        </div>
        {query.reset === "sent" && <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">ส่งลิงก์ตั้งรหัสผ่านใหม่แล้ว</p>}
        <Card className="mt-6 overflow-hidden">
          <CardHeader className="border-b"><CardTitle>บัญชีทั้งหมด ({accessRows?.length ?? 0})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50 text-left"><tr><th className="px-5 py-3 font-medium">ผู้ใช้</th><th className="px-5 py-3 font-medium">สิทธิ์</th><th className="px-5 py-3 font-medium">สถานะ</th><th className="px-5 py-3 text-right font-medium">จัดการ</th></tr></thead>
                <tbody>
                  {accessRows?.map((row) => {
                    const profile = profileMap.get(row.user_id);
                    const isSelf = row.user_id === admin.user.id;
                    const userName = profile?.display_name ?? row.email;
                    return (
                      <tr key={row.user_id} className="border-b last:border-0">
                        <td className="px-5 py-4"><p className="font-medium">{userName}{isSelf && " (คุณ)"}</p><p className="text-muted-foreground">{row.email}</p></td>
                        <td className="px-5 py-4"><Badge variant="outline">{row.role === "admin" ? "แอดมิน" : "ครู"}</Badge></td>
                        <td className="px-5 py-4"><Badge variant={row.status === "approved" ? "default" : "secondary"}>{row.status === "approved" ? "อนุมัติแล้ว" : row.status === "pending" ? "รออนุมัติ" : "ระงับ"}</Badge></td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            {row.status !== "approved" && <form action={setUserStatusAction}><input type="hidden" name="user_id" value={row.user_id} /><input type="hidden" name="status" value="approved" /><Button size="sm"><CheckCircle2 className="mr-1 size-4" />อนุมัติ</Button></form>}
                            {row.status === "approved" && !isSelf && <form action={setUserStatusAction}><input type="hidden" name="user_id" value={row.user_id} /><input type="hidden" name="status" value="suspended" /><Button size="sm" variant="outline"><UserX className="mr-1 size-4" />ระงับ</Button></form>}
                            <AdminPasswordDialog userId={row.user_id} userName={userName} />
                            <form action={sendPasswordResetAction}><input type="hidden" name="user_id" value={row.user_id} /><Button size="sm" variant="ghost"><Mail className="mr-1 size-4" />ส่งลิงก์รีเซ็ต</Button></form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
