import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, BookOpen, Copy, MoreHorizontal, Play, Plus, Share2, Sparkles, Users } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const metadata: Metadata = { title: "แดชบอร์ดครู" };

const stats = [
  { label: "ชุดคำทั้งหมด", value: "2", suffix: "ชุด", icon: BookOpen },
  { label: "จำนวนคำทั้งหมด", value: "50", suffix: "คำ", icon: Sparkles },
  { label: "เล่นทั้งหมด", value: "18", suffix: "ครั้ง", icon: BarChart3 },
  { label: "ผู้เรียนเข้าร่วม", value: "132", suffix: "คน", icon: Users },
];

const sets = [
  { title: "คำพื้นฐาน ป.1–3", words: 30, plays: 12, grade: "ป.1–3", color: "bg-blue-600", letters: "ก ข" },
  { title: "คำท้าทาย ป.4–6", words: 20, plays: 6, grade: "ป.4–6", color: "bg-violet-600", letters: "คิด" },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-muted/35">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6"><BrandLogo /><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-medium">ครูดิส</p><p className="text-xs text-muted-foreground">บัญชีครู</p></div><Avatar className="size-9"><AvatarFallback className="bg-blue-100 font-semibold text-primary">คด</AvatarFallback></Avatar></div></div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-primary">แดชบอร์ดครู</p><h1 className="mt-1 text-3xl font-bold tracking-tight">สวัสดีครับ ครูดิส 👋</h1><p className="mt-2 text-muted-foreground">พร้อมสร้างกิจกรรมสนุก ๆ ให้เด็กวันนี้หรือยัง?</p></div><Button asChild size="lg" className="rounded-full px-6"><Link href="/create"><Plus className="mr-1 size-4" /> สร้างชุดคำใหม่</Link></Button></div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (<Card key={stat.label}><CardContent className="flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-primary"><stat.icon className="size-5" /></span><div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-0.5 text-2xl font-bold">{stat.value} <span className="text-sm font-normal text-muted-foreground">{stat.suffix}</span></p></div></CardContent></Card>))}
        </div>

        <Card className="mt-8">
          <CardHeader className="flex-row items-center justify-between border-b"><div><CardTitle>ชุดคำของฉัน</CardTitle><p className="mt-1 text-sm text-muted-foreground">จัดการและเริ่มเกมจากชุดคำที่สร้างไว้</p></div><Button asChild variant="outline" size="sm"><Link href="/create">ดูทั้งหมด</Link></Button></CardHeader>
          <CardContent className="grid gap-5 p-5 md:grid-cols-2">
            {sets.map((set) => (
              <div key={set.title} className="overflow-hidden rounded-2xl border bg-background">
                <div className={`${set.color} relative flex h-32 items-center justify-center overflow-hidden text-white`}><span className="absolute -right-7 -top-7 size-28 rounded-full bg-white/10" /><span className="absolute -bottom-8 -left-5 size-24 rounded-full bg-white/10" /><span className="relative text-4xl font-bold tracking-wider">{set.letters}</span><Badge className="absolute left-3 top-3 border-white/20 bg-white/15 text-white hover:bg-white/15">{set.grade}</Badge></div>
                <div className="p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold">{set.title}</h3><p className="mt-1 text-sm text-muted-foreground">{set.words} คำ · เล่น {set.plays} ครั้ง</p></div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /><span className="sr-only">เมนูเพิ่มเติม</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem><Copy className="mr-2 size-4" /> ทำสำเนา</DropdownMenuItem><DropdownMenuItem><Share2 className="mr-2 size-4" /> แชร์</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div><div className="mt-4 grid grid-cols-[1fr_auto] gap-2"><Button asChild><Link href="/play/demo"><Play className="mr-1 size-4 fill-current" /> เริ่มเล่น</Link></Button><Button variant="outline" size="icon"><Share2 className="size-4" /><span className="sr-only">แชร์</span></Button></div></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
