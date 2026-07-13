import Link from "next/link";
import { Clock3, LogOut, MailCheck } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentAccount } from "@/lib/auth";

export default async function PendingPage() {
  const account = await getCurrentAccount();
  return (
    <main className="grid min-h-screen place-items-center bg-muted/35 px-4 py-10">
      <Card className="w-full max-w-lg text-center">
        <CardHeader><div className="mx-auto mb-4"><BrandLogo /></div><span className="mx-auto grid size-14 place-items-center rounded-full bg-amber-100 text-amber-700"><Clock3 className="size-7" /></span><CardTitle className="mt-4 text-2xl">รอการอนุมัติจากแอดมิน</CardTitle></CardHeader>
        <CardContent className="space-y-5"><p className="leading-7 text-muted-foreground">สมัครสมาชิกสำเร็จแล้ว กรุณายืนยันอีเมล และรอผู้ดูแลอนุมัติบัญชีก่อนเริ่มสร้างชุดคำ</p><p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700"><MailCheck className="size-4" /> {account?.user.email ?? "ตรวจสอบอีเมลที่ใช้สมัคร"}</p><div className="flex justify-center gap-2"><Button asChild variant="outline"><Link href="/">กลับหน้าแรก</Link></Button>{account && <form action={logoutAction}><Button variant="ghost" type="submit"><LogOut className="mr-2 size-4" />ออกจากระบบ</Button></form>}</div></CardContent>
      </Card>
    </main>
  );
}
