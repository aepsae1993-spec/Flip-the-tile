import Link from "next/link";
import { BookOpen, ExternalLink, ImageIcon, LogOut, Play, Plus, Settings, Share2, ShieldCheck, Sparkles, UserRound } from "lucide-react";
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

type DashboardSet = {
  id: string;
  title: string;
  description: string | null;
  content_type: "word" | "image";
  public_slug: string | null;
  is_published: boolean;
  is_shared_with_members: boolean;
  teacher_id: string;
  created_at: string;
  word_cards: Array<{ count: number }>;
};

type ShareItem = { id: string; recipientEmail: string };

function WordSetTile({ set, shares, received = false }: { set: DashboardSet; shares?: ShareItem[]; received?: boolean }) {
  const playHref = set.public_slug ? `/play/${set.public_slug}` : "/dashboard";
  return (
    <article className="overflow-hidden rounded-2xl border bg-background">
      <div className="grid h-28 place-items-center bg-primary text-3xl font-bold text-primary-foreground">
        {set.content_type === "image" ? <ImageIcon className="size-10" /> : "ก ข"}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate font-semibold">{set.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{set.word_cards?.[0]?.count ?? 0} {set.content_type === "image" ? "รูป" : "คำ"}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {received
              ? <Badge variant="secondary"><Share2 className="mr-1 size-3" />ได้รับแชร์</Badge>
              : <><Badge variant={set.is_published ? "default" : "secondary"}>{set.is_published ? "สาธารณะ" : set.is_shared_with_members ? "สมาชิกทุกคน" : "ส่วนตัว"}</Badge><WordSetActions id={set.id} title={set.title} shares={shares} sharedWithAll={set.is_shared_with_members} /></>}
          </div>
        </div>
        {received ? (
          <Button asChild className="mt-4 w-full"><Link href={playHref}><Play className="mr-1 size-4" />เปิดเล่นชุดคำ</Link></Button>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button asChild><Link href={playHref}><Play className="mr-1 size-4" />เล่น</Link></Button>
            <Button asChild variant="outline"><Link href={playHref} target="_blank"><ExternalLink className="mr-1 size-4" />เปิดลิงก์</Link></Button>
          </div>
        )}
      </div>
    </article>
  );
}

export default async function DashboardPage() {
  const account = await requireApprovedUser();
  const supabase = await createClient();
  const setFields = "id,title,description,content_type,public_slug,is_published,is_shared_with_members,teacher_id,created_at,word_cards(count)";
  const [ownResult, ownedSharesResult, receivedSharesResult, allMemberSetsResult] = await Promise.all([
    supabase.from("word_sets").select(setFields).eq("teacher_id", account.user.id).order("created_at", { ascending: false }),
    supabase.from("word_set_shares").select("id,word_set_id,recipient_email").eq("owner_id", account.user.id).order("created_at", { ascending: true }),
    supabase.from("word_set_shares").select(`id,created_at,word_set:word_sets!word_set_shares_word_set_id_fkey(${setFields})`).eq("recipient_id", account.user.id).order("created_at", { ascending: false }),
    supabase.from("word_sets").select(setFields).eq("is_shared_with_members", true).neq("teacher_id", account.user.id).order("created_at", { ascending: false }),
  ]);

  const sets = (ownResult.data ?? []) as DashboardSet[];
  const shareMap = new Map<string, ShareItem[]>();
  for (const share of ownedSharesResult.data ?? []) {
    const items = shareMap.get(share.word_set_id) ?? [];
    items.push({ id: share.id, recipientEmail: share.recipient_email });
    shareMap.set(share.word_set_id, items);
  }
  const directlySharedSets = (receivedSharesResult.data ?? []).flatMap((row) => {
    const value = Array.isArray(row.word_set) ? row.word_set[0] : row.word_set;
    return value ? [value as DashboardSet] : [];
  });
  const sharedSetMap = new Map<string, DashboardSet>();
  for (const set of [...(allMemberSetsResult.data ?? []) as DashboardSet[], ...directlySharedSets]) {
    sharedSetMap.set(set.id, set);
  }
  const sharedSets = [...sharedSetMap.values()];

  const totalWords = sets.reduce((sum, set) => sum + (set.word_cards?.[0]?.count ?? 0), 0);
  const name = account.profile?.display_name ?? account.user.email ?? "คุณครู";
  const initials = name.slice(0, 2);

  return (
    <main className="min-h-screen bg-muted/35">
      <header className="border-b bg-background">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <BrandLogo />
          <div className="flex items-center gap-2">
            {account.access?.role === "admin" && <Button asChild variant="outline" size="sm"><Link href="/admin/users"><ShieldCheck className="mr-2 size-4" />จัดการผู้ใช้</Link></Button>}
            <ThemeSwitcher compact />
            <Button asChild variant="ghost" size="icon"><Link href="/settings" aria-label="ตั้งค่าบัญชี"><Settings className="size-4" /></Link></Button>
            <Avatar className="size-9"><AvatarFallback>{initials}</AvatarFallback></Avatar>
            <form action={logoutAction}><Button type="submit" variant="ghost" size="icon" aria-label="ออกจากระบบ"><LogOut className="size-4" /></Button></form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-sm font-semibold text-primary">แดชบอร์ดครู</p><h1 className="mt-1 text-3xl font-bold tracking-tight">สวัสดีครับ {name}</h1><p className="mt-2 text-muted-foreground">ชุดป้ายของคุณและชุดที่สมาชิกแชร์ให้ พร้อมเปิดใช้งานได้จากทุกอุปกรณ์</p></div>
          <Button asChild size="lg" className="rounded-full px-6"><Link href="/create"><Plus className="mr-1 size-4" />สร้างชุดป้ายใหม่</Link></Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="flex items-center gap-4 p-5"><BookOpen className="size-6 text-primary" /><div><p className="text-sm text-muted-foreground">ชุดป้ายของฉัน</p><p className="text-2xl font-bold">{sets.length}</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-5"><Sparkles className="size-6 text-primary" /><div><p className="text-sm text-muted-foreground">ป้ายทั้งหมด</p><p className="text-2xl font-bold">{totalWords}</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-5"><Share2 className="size-6 text-primary" /><div><p className="text-sm text-muted-foreground">ได้รับการแชร์</p><p className="text-2xl font-bold">{sharedSets.length}</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-5"><UserRound className="size-6 text-primary" /><div><p className="text-sm text-muted-foreground">โปรไฟล์สาธารณะ</p><Link className="text-sm font-medium text-primary hover:underline" href={`/teacher/${account.profile?.username}`}>เปิดโปรไฟล์</Link></div></CardContent></Card>
        </div>

        <Card className="mt-8">
          <CardHeader className="border-b"><CardTitle>ชุดป้ายของฉัน</CardTitle></CardHeader>
          <CardContent className="p-5">
            {!sets.length ? (
              <div className="py-12 text-center"><BookOpen className="mx-auto size-10 text-muted-foreground" /><h2 className="mt-4 font-semibold">ยังไม่มีชุดป้าย</h2><p className="mt-1 text-sm text-muted-foreground">สร้างชุดแรก แล้วระบบจะเก็บไว้ในโปรไฟล์ของคุณ</p><Button asChild className="mt-5"><Link href="/create">สร้างชุดป้าย</Link></Button></div>
            ) : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{sets.map((set) => <WordSetTile key={set.id} set={set} shares={shareMap.get(set.id)} />)}</div>}
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><Share2 className="size-5 text-primary" />ชุดคำที่สมาชิกแชร์ให้ฉัน</CardTitle></CardHeader>
          <CardContent className="p-5">
            {!sharedSets.length ? (
              <div className="py-10 text-center"><Share2 className="mx-auto size-9 text-muted-foreground" /><p className="mt-3 font-medium">ยังไม่มีชุดคำที่ได้รับแชร์</p><p className="mt-1 text-sm text-muted-foreground">เมื่อสมาชิกแชร์ชุดคำให้สมาชิกทุกคนหรือแชร์ให้คุณโดยตรง ชุดนั้นจะแสดงที่นี่</p></div>
            ) : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{sharedSets.map((set) => <WordSetTile key={set.id} set={set} received />)}</div>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
