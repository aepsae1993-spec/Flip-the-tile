"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Expand, House, RotateCcw, Shuffle, Sparkles, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ThemeSwitcher } from "@/components/theme-provider";
import { CardThemeSwitcher, useCardTheme } from "@/components/card-theme-switcher";

type CardStatus = "new" | "correct" | "retry";
type GameCard = { id: number; word: string; opened: boolean; status: CardStatus };

const defaultWords = ["บัว", "ปลา", "ม้า", "บ้าน", "ทะเล", "โรงเรียน", "ดอกไม้", "พระอาทิตย์", "สายรุ้ง", "ครอบครัว", "ความสุข", "ขอบคุณ"];

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}

function AutoFitWord({ word }: { word: string }) {
  const wordRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    if (!wordRef.current?.parentElement) return;
    const element = wordRef.current;
    const container = wordRef.current.parentElement;

    function fitWord() {
      element.style.fontSize = "96px";
      element.style.whiteSpace = "nowrap";
      element.style.wordBreak = "normal";
      const availableWidth = element.clientWidth - 8;
      const fittedSize = Math.floor(96 * (availableWidth / element.scrollWidth));

      if (fittedSize >= 24) {
        element.style.fontSize = `${Math.min(96, fittedSize)}px`;
      } else {
        element.style.fontSize = "24px";
        element.style.whiteSpace = "normal";
        element.style.wordBreak = "break-all";
      }
    }

    fitWord();
    const observer = new ResizeObserver(fitWord);
    observer.observe(container);
    return () => observer.disconnect();
  }, [word]);

  return <p ref={wordRef} className="w-full overflow-hidden text-center font-bold leading-tight tracking-tight text-foreground">{word}</p>;
}

export function GameBoard({ title: initialTitle, words: initialWords }: { title?: string; words?: string[] }) {
  const title = initialTitle ?? "คำพื้นฐาน ป.1–3";
  const [cards, setCards] = useState<GameCard[]>(() => (initialWords?.length ? initialWords : defaultWords).map((word, index) => ({ id: index + 1, word, opened: false, status: "new" })));
  const [activeId, setActiveId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { theme: cardTheme } = useCardTheme();

  const activeCard = cards.find((card) => card.id === activeId) ?? null;
  const reviewed = cards.filter((card) => card.status !== "new").length;
  const correct = cards.filter((card) => card.status === "correct").length;
  const progress = cards.length ? (reviewed / cards.length) * 100 : 0;

  const openCard = useCallback((id: number) => {
    setCards((current) => current.map((card) => card.id === id ? { ...card, opened: true } : card));
    setActiveId(id);
    setDialogOpen(true);
  }, []);

  function mark(status: CardStatus) {
    if (activeId === null) return;
    setCards((current) => current.map((card) => card.id === activeId ? { ...card, status } : card));
    setDialogOpen(false);
  }

  function randomCard() {
    const available = cards.filter((card) => card.status === "new");
    const pool = available.length ? available : cards;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    if (picked) openCard(picked.id);
  }

  function resetGame() {
    setCards((current) => shuffle(current.map<GameCard>((card) => ({ ...card, opened: false, status: "new" }))).map((card, index) => ({ ...card, id: index + 1 })));
    setActiveId(null);
    setDialogOpen(false);
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen();
  }

  const gridClass = useMemo(() => cards.length > 20 ? "grid-cols-4 sm:grid-cols-5 lg:grid-cols-6" : cards.length > 12 ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5" : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-4", [cards.length]);

  return (
    <main className="min-h-screen bg-muted/35">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3"><Button asChild variant="ghost" size="icon" aria-label="กลับหน้าแรก"><Link href="/"><House className="size-5" /></Link></Button><div><h1 className="font-semibold">{title}</h1><p className="text-xs text-muted-foreground">เปิดแล้ว {reviewed} จาก {cards.length} คำ</p></div></div>
          <div className="flex flex-wrap items-center justify-end gap-2"><CardThemeSwitcher /><ThemeSwitcher compact /><Button variant="outline" size="icon" onClick={toggleFullscreen} aria-label="เต็มหน้าจอ"><Expand className="size-4" /></Button><Button variant="outline" size="icon" aria-label="เปิดเสียง"><Volume2 className="size-4" /></Button><Button variant="outline" size="sm" onClick={resetGame}><RotateCcw className="mr-1 size-4" /> เริ่มใหม่</Button></div>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2"><Badge variant="secondary" className="rounded-full px-3 py-1.5">ทั้งหมด {cards.length}</Badge><Badge className="rounded-full bg-emerald-600 px-3 py-1.5 hover:bg-emerald-600">อ่านถูก {correct}</Badge></div>
          <Button onClick={randomCard} className="rounded-full shadow-md shadow-primary/20"><Shuffle className="mr-2 size-4" /> สุ่มแผ่นป้าย</Button>
        </div>
        <div className={`grid gap-3 sm:gap-4 ${gridClass}`}>
          {cards.map((card) => (
            <button key={card.id} type="button" onClick={() => openCard(card.id)} aria-label={card.opened ? `เปิดคำว่า ${card.word}` : `เปิดป้ายหมายเลข ${card.id}`} className={`card-perspective aspect-[4/3] min-h-24 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${card.opened ? "card-flipped" : ""}`}>
              <span className="card-inner relative block size-full">
                <span className={`card-face absolute inset-0 grid place-items-center overflow-hidden rounded-2xl border-2 text-3xl font-bold shadow-sm transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-lg sm:text-4xl ${cardTheme.front}`}><span className={`absolute -right-5 -top-5 size-16 rounded-full ${cardTheme.decoration}`} /><span className={`absolute bottom-3 left-3 size-1.5 rounded-full ${cardTheme.decoration}`} /><span className="relative drop-shadow-sm">{card.id}</span></span>
                <span className={`card-face card-back absolute inset-0 grid min-w-0 place-items-center overflow-hidden rounded-2xl px-2 text-center font-bold shadow-lg ${card.status === "correct" ? "bg-emerald-600 text-white" : card.status === "retry" ? "bg-amber-400 text-amber-950" : cardTheme.back}`}><span className="max-w-full break-words text-[clamp(.85rem,2.6vw,2rem)] leading-tight [overflow-wrap:anywhere]">{card.word}</span>{card.status === "correct" && <Check className="absolute right-2 top-2 size-5" />}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl overflow-hidden border-0 p-0 sm:rounded-[2rem]">
          <div className="bg-muted/65 px-6 py-5"><DialogHeader><DialogTitle className="flex items-center justify-center gap-2 text-base text-primary"><Sparkles className="size-4" /> อ่านคำนี้ให้ฟังหน่อย</DialogTitle><DialogDescription className="text-center">ป้ายหมายเลข {activeCard?.id}</DialogDescription></DialogHeader></div>
          <div className="grid min-h-56 min-w-0 place-items-center overflow-hidden px-6 py-10"><AutoFitWord word={activeCard?.word ?? ""} /></div>
          <div className="grid grid-cols-2 gap-3 border-t bg-muted/35 p-4 sm:p-5"><Button className="h-12 bg-emerald-600 text-base hover:bg-emerald-700" onClick={() => mark("correct")}><Check className="mr-2 size-5" /> อ่านถูก</Button><Button variant="outline" className="h-12 border-amber-400 bg-amber-400/10 text-base text-foreground hover:bg-amber-400/20" onClick={() => mark("retry")}><RotateCcw className="mr-2 size-4" /> ผิด</Button></div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
