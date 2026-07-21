"use client";

import { useMemo, useState } from "react";
import { FlaskConical, InfinityIcon, Layers3, Play } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { GameBoard } from "@/components/game-board";
import { ThemeSwitcher } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const sampleWords = "โรงเรียน\nปลา\nม้า\nบ้าน\nทะเล\nห้องเรียน\nดอกไม้\nพระอาทิตย์\nสายรุ้ง\nครอบครัว\nความสุข\nขอบคุณ";

type DemoConfig = { title: string; words: string[] };
type DemoCount = 12 | 20 | "all";

export function DemoGame() {
  const [title, setTitle] = useState("ชุดคำทดลอง");
  const [rawWords, setRawWords] = useState(sampleWords);
  const [count, setCount] = useState<DemoCount>(12);
  const [game, setGame] = useState<DemoConfig | null>(null);
  const allWords = useMemo(
    () => rawWords.split(/\r?\n|,/).map((word) => word.trim()).filter(Boolean),
    [rawWords],
  );
  const words = count === "all" ? allWords : allWords.slice(0, count);

  if (game) {
    return <GameBoard title={game.title} words={game.words} onEditWords={() => setGame(null)} />;
  }

  const isReady = count === "all" ? words.length >= 2 : words.length === count;

  return (
    <main className="min-h-screen bg-muted/35">
      <header className="border-b bg-background/95 backdrop-blur"><div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6"><BrandLogo /><ThemeSwitcher compact /></div></header>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-7 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><FlaskConical className="size-7" /></span>
          <p className="mt-5 text-sm font-semibold text-primary">โหมดทดลอง</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">ใส่คำของคุณแล้วทดลองเล่น</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">กรอกหนึ่งคำต่อหนึ่งบรรทัด แล้วเปิดเกมได้ทันทีโดยไม่ต้องสมัครสมาชิก</p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="space-y-6 p-5 sm:p-7">
            <div className="space-y-2">
              <Label htmlFor="demo-title">ชื่อชุดคำ</Label>
              <Input id="demo-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} />
            </div>
            <div className="space-y-3">
              <Label className="flex items-center gap-2"><Layers3 className="size-4 text-primary" />จำนวนแผ่นป้าย</Label>
              <div className="grid grid-cols-3 gap-3">
                {([12, 20] as const).map((option) => (
                  <Button key={option} type="button" variant={count === option ? "default" : "outline"} className="h-12 text-base" onClick={() => setCount(option)}>
                    {option} คำ
                  </Button>
                ))}
                <Button type="button" variant={count === "all" ? "default" : "outline"} className="h-12 text-base" onClick={() => setCount("all")}><InfinityIcon className="mr-1.5 size-4" /> ทั้งหมด</Button>
              </div>
              <p className="text-xs text-muted-foreground">เลือก “ทั้งหมด” เพื่อใช้ทุกคำที่กรอก เหมาะสำหรับโหมดวงล้อและไม่จำกัดจำนวน</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3"><Label htmlFor="demo-words">คำสำหรับเล่น</Label><span className={`text-sm font-medium ${isReady ? "text-emerald-600" : "text-muted-foreground"}`}>{count === "all" ? `${words.length} คำ` : `${words.length} / ${count} คำ`}</span></div>
              <Textarea id="demo-words" value={rawWords} onChange={(event) => setRawWords(event.target.value)} className="min-h-72 resize-y text-base leading-8" placeholder={'โรงเรียน\nคุณครู\nห้องเรียน'} />
              {count !== "all" && words.length < count && <p className="text-sm text-amber-700">เพิ่มอีก {count - words.length} คำเพื่อให้ครบ {count} แผ่น</p>}
              {count !== "all" && allWords.length > count && <p className="text-sm text-muted-foreground">ระบบจะใช้ {count} คำแรกตามจำนวนที่เลือก</p>}
              {count === "all" && words.length < 2 && <p className="text-sm text-amber-700">เพิ่มอย่างน้อย 2 คำเพื่อเริ่มเล่น</p>}
            </div>
            <Button type="button" size="lg" className="w-full rounded-full" disabled={!isReady} onClick={() => setGame({ title: title.trim() || "ชุดคำทดลอง", words })}>
              <Play className="mr-2 size-5" /> เริ่มทดลองเล่น {words.length} แผ่น
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
