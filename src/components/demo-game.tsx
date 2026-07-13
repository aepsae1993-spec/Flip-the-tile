"use client";

import { useMemo, useState } from "react";
import { FlaskConical, Play, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { GameBoard } from "@/components/game-board";
import { ThemeSwitcher } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const sampleWords = "โรงเรียน\nปลา\nม้า\nบ้าน\nทะเล\nห้องเรียน\nดอกไม้\nพระอาทิตย์\nสายรุ้ง\nครอบครัว\nความสุข\nขอบคุณ";

type DemoConfig = { title: string; words: string[] };

export function DemoGame() {
  const [title, setTitle] = useState("ชุดคำทดลอง");
  const [rawWords, setRawWords] = useState(sampleWords);
  const [game, setGame] = useState<DemoConfig | null>(null);
  const words = useMemo(
    () => rawWords.split(/\r?\n|,/).map((word) => word.trim()).filter(Boolean).slice(0, 100),
    [rawWords],
  );

  if (game) {
    return <GameBoard title={game.title} words={game.words} onEditWords={() => setGame(null)} />;
  }

  const isReady = words.length >= 2;

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
          <CardHeader className="border-b bg-muted/35">
            <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="size-5 text-emerald-600" />ข้อมูลนี้ไม่ถูกบันทึกลง Supabase</CardTitle>
            <p className="text-sm text-muted-foreground">คำทั้งหมดอยู่เฉพาะในหน่วยความจำของหน้านี้ และจะหายเมื่อรีเฟรชหรือปิดหน้า</p>
          </CardHeader>
          <CardContent className="space-y-6 p-5 sm:p-7">
            <div className="space-y-2">
              <Label htmlFor="demo-title">ชื่อชุดคำ</Label>
              <Input id="demo-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3"><Label htmlFor="demo-words">คำสำหรับเล่น</Label><span className="text-sm font-medium text-muted-foreground">{words.length} / 100 คำ</span></div>
              <Textarea id="demo-words" value={rawWords} onChange={(event) => setRawWords(event.target.value)} className="min-h-72 resize-y text-base leading-8" placeholder={'โรงเรียน\nคุณครู\nห้องเรียน'} />
              {!isReady && <p className="text-sm text-amber-700">กรุณาใส่อย่างน้อย 2 คำ</p>}
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
