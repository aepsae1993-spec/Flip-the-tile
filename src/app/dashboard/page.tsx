import Link from "next/link";
import { BookOpen, ExternalLink, LogOut, Play, Plus, Settings, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import { BrandLogo } from "@/components/brand-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/theme-provider";
import { WordSetActions } from "@/components/word-set-actions";
import { requireApprovedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const account = await requireApprovedUser();
  const supabase = await createClient();
  const { data: sets } = await supabase.from("word_sets").select("id,title,description,public_slug,is_published,created_at,word_cards(count)").eq("teacher_id", account.user.id).order("created_at", { ascending: false });
  const totalWords = (sets ?? []).reduce((sum, set) => sum + (set.word_cards?.[0]?.count ?? 0), 0);
  const name = account.profile?.display_name ?? account.user.email ?? "คุณครู";
  const initials = name.slice(0, 2);

  return (
    <main className="min-h-screen bg-muted/35">
      <header className="border-b bg-background"><div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6"><BrandLogo /><div className="flex items-center gap-2">{account.access?.role === "admin" && <Button asChild variant="outline" size="sm"><Link href="/admin/users"><ShieldCheck className="mr-2 size-4" />จัดการผู้ใช้</Link></Button>}<ThemeSwitcher compact /><Button asChild variant="ghost" size="icon"><Link href="/settings" aria-label="ตั้งค่าบัญชี"><Settings className="size-4" /></Link></Button><Avatar className="size-9"><AvatarFallback>{initials}</AvatarFallback></Avatar><form action={logoutAction}><Button type="submit" variant="ghost" size="icon" aria-label="ออกจากระบบ"><LogOut className="size-4" /></Button></form></div></div></header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-primary">แดชบอร์ดครู</p><h1 className="mt-1 text-3xl font-bold tracking-tight">สวัสดีครับ {name}</h1><p className="mt-2 text-muted-foreground">ชุดคำทุกชุดบันทึกบน Supabase และเปิดได้จากทุกอุปกรณ์</p></div><Button asChild size="lg" className="rounded-full px-6"><Link href="/create"><Plus className="mr-1 size-4" />สร้างชุดคำใหม่</Link></Button></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3"><Card><CardContent className="flex items-center gap-4 p-5"><BookOpen className="size-6 text-primary" /><div><p className="text-sm text-muted-foreground">ชุดคำทั้งหมด</p><p className="text-2xl font-bold">{sets?.length ?? 0}</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-4 p-5"><Sparkles className="size-6 text-primary" /><div><p className="text-sm text-muted-foreground">คำทั้งหมด</p><p className="text-2xl font-bold">{totalWords}</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-4 p-5"><UserRound className="size-6 text-primary" /><div><p className="text-sm text-muted-foreground">โปรไฟล์สาธารณะ</p><Link className="text-sm font-medium text-primary hover:underline" href={`/teacher/${account.profile?.username}`}>เปิดโปรไฟล์</Link></div></CardContent></Card></div>
        <Card className="mt-8"><CardHeader className="border-b"><CardTitle>ชุดคำของฉัน</CardTitle></CardHeader><CardContent className="p-5">{!sets?.length ? <div className="py-12 text-center"><BookOpen className="mx-auto size-10 text-muted-foreground" /><h2 className="mt-4 font-semibold">ยังไม่มีชุดคำ</h2><p className="mt-1 text-sm text-muted-foreground">สร้างชุดแรก แล้วระบบจะเก็บไว้ในโปรไฟล์ของคุณ</p><Button asChild className="mt-5"><Link href="/create">สร้างชุดคำ</Link></Button></div> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{sets.map((set) => <article key={set.id} className="overflow-hidden rounded-2xl border bg-background"><div className="grid h-28 place-items-center bg-primary text-3xl font-bold text-primary-foreground">ก ข</div><div className="p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h2 className="truncate font-semibold">{set.title}</h2><p className="mt-1 text-sm text-muted-foreground">{set.word_cards?.[0]?.count ?? 0} คำ</p></div><div className="flex shrink-0 items-center gap-1"><Badge variant={set.is_published ? "default" : "secondary"}>{set.is_published ? "สาธารณะ" : "ส่วนตัว"}</Badge><WordSetActions id={set.id} title={set.title} /></div></div><div className="mt-4 grid grid-cols-2 gap-2"><Button asChild><Link href={`/play/${set.public_slug}`}><Play className="mr-1 size-4" />เล่น</Link></Button><Button asChild variant="outline"><Link href={`/play/${set.public_slug}`} target="_blank"><ExternalLink className="mr-1 size-4" />เปิดลิงก์</Link></Button></div></div></article>)}</div>}</CardContent></Card>
      </div>
    </main>
  );
}
