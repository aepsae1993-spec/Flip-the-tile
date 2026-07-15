"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Expand, House, PencilLine, RotateCcw, Shuffle, Sparkles, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ThemeSwitcher } from "@/components/theme-provider";
import { CardThemeSwitcher, useCardTheme } from "@/components/card-theme-switcher";
import { SCHOOL_LOGO_URL, SCHOOL_NAME } from "@/lib/school";

type CardStatus = "new" | "correct" | "retry";
type GameBoardCard = { word: string; imageUrl?: string | null };
type GameCard = { id: number; word: string; imageUrl: string | null; opened: boolean; status: CardStatus };

const defaultWords = ["โรงเรียน", "ปลา", "ม้า", "บ้าน", "ทะเล", "ห้องเรียน", "ดอกไม้", "พระอาทิตย์", "สายรุ้ง", "ครอบครัว", "ความสุข", "ขอบคุณ"];

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
      const maximumSize = 160;
      element.style.fontSize = `${maximumSize}px`;
      element.style.whiteSpace = "nowrap";
      element.style.wordBreak = "normal";
      const availableWidth = element.clientWidth - 8;
      const fittedSize = Math.floor(maximumSize * (availableWidth / element.scrollWidth));

      if (fittedSize >= 32) {
        element.style.fontSize = `${Math.min(maximumSize, fittedSize)}px`;
      } else {
        element.style.fontSize = "32px";
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

export function GameBoard({ title: initialTitle, words: initialWords, cards: initialCards, onEditWords }: { title?: string; words?: string[]; cards?: GameBoardCard[]; onEditWords?: () => void }) {
  const title = initialTitle ?? "คำพื้นฐาน ป.1–3";
  const [cards, setCards] = useState<GameCard[]>(() => {
    const sourceCards = initialCards?.length
      ? initialCards
      : (initialWords?.length ? initialWords : defaultWords).map((word) => ({ word, imageUrl: null }));
    return sourceCards.map((card, index) => ({ id: index + 1, word: card.word, imageUrl: card.imageUrl ?? null, opened: false, status: "new" }));
  });
  const [activeId, setActiveId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const imageUrls = useRef(cards.flatMap((card) => card.imageUrl ? [card.imageUrl] : []));
  const { theme: cardTheme } = useCardTheme();

  useEffect(() => {
    const preloaders = imageUrls.current.map((src) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = src;
      void image.decode().catch(() => undefined);
      return image;
    });

    return () => preloaders.forEach((image) => { image.src = ""; });
  }, []);

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

  const boardLayout = useMemo(() => {
    if (cards.length === 16) {
      return {
        grid: "grid-cols-2 sm:grid-cols-4",
        card: "aspect-[4/3] sm:aspect-[16/9]",
      };
    }

    if (cards.length > 20) {
      return {
        grid: "grid-cols-4 sm:grid-cols-5 lg:grid-cols-6",
        card: "aspect-[4/3]",
      };
    }

    if (cards.length > 12) {
      return {
        grid: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5",
        card: "aspect-[4/3]",
      };
    }

    return {
      grid: "grid-cols-3 sm:grid-cols-4",
      card: "aspect-[4/3]",
    };
  }, [cards.length]);

  return (
    <main className="min-h-screen bg-muted/35">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5"><Button asChild variant="ghost" size="icon" className="shrink-0" aria-label="กลับหน้าแรก"><Link href="/"><House className="size-5" /></Link></Button><Image src={SCHOOL_LOGO_URL} width={38} height={38} sizes="38px" priority alt={`ตรา${SCHOOL_NAME}`} className="size-9 shrink-0 object-contain" /><div className="min-w-0"><p className="text-[10px] leading-tight font-medium text-muted-foreground sm:text-xs">โรงเรียนวัดบางขุด <span className="whitespace-nowrap">(อุ่นพิทยาคาร)</span></p><h1 className="font-semibold">{title}</h1><p className="text-xs text-muted-foreground">เปิดแล้ว {reviewed} จาก {cards.length} คำ</p></div></div>
          <div className="flex flex-wrap items-center justify-end gap-2">{onEditWords && <Button variant="outline" size="sm" onClick={onEditWords}><PencilLine className="mr-1 size-4" /> แก้คำ</Button>}<CardThemeSwitcher /><ThemeSwitcher compact /><Button variant="outline" size="icon" onClick={toggleFullscreen} aria-label="เต็มหน้าจอ"><Expand className="size-4" /></Button><Button variant="outline" size="icon" aria-label="เปิดเสียง"><Volume2 className="size-4" /></Button><Button variant="outline" size="sm" onClick={resetGame}><RotateCcw className="mr-1 size-4" /> เริ่มใหม่</Button></div>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2"><Badge variant="secondary" className="rounded-full px-3 py-1.5">ทั้งหมด {cards.length}</Badge><Badge className="rounded-full bg-emerald-600 px-3 py-1.5 hover:bg-emerald-600">อ่านถูก {correct}</Badge></div>
          <Button onClick={randomCard} className="rounded-full shadow-md shadow-primary/20"><Shuffle className="mr-2 size-4" /> สุ่มแผ่นป้าย</Button>
        </div>
        <div className={`grid gap-3 sm:gap-4 ${boardLayout.grid}`}>
          {cards.map((card) => (
            <button key={card.id} type="button" onClick={() => openCard(card.id)} aria-label={card.opened ? `เปิดคำว่า ${card.word}` : `เปิดป้ายหมายเลข ${card.id}`} className={`card-perspective min-h-24 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${boardLayout.card} ${card.opened ? "card-flipped" : ""}`}>
              <span className="card-inner relative block size-full">
                <span className={`card-face absolute inset-0 grid place-items-center overflow-hidden rounded-2xl border-2 text-3xl font-bold shadow-sm transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-lg sm:text-4xl ${cardTheme.front}`}><span className={`absolute -right-5 -top-5 size-16 rounded-full ${cardTheme.decoration}`} /><span className={`absolute bottom-3 left-3 size-1.5 rounded-full ${cardTheme.decoration}`} /><span className="relative drop-shadow-sm">{card.id}</span></span>
                <span className={`card-face card-back absolute inset-0 grid min-w-0 place-items-center overflow-hidden rounded-2xl px-2 text-center font-bold shadow-lg ${card.status === "correct" ? "bg-emerald-600 text-white" : card.status === "retry" ? "bg-amber-400 text-amber-950" : cardTheme.back}`}>
                  {card.imageUrl ? <span className="relative block size-full overflow-hidden rounded-xl bg-white/95"><Image src={card.imageUrl} alt={card.word} fill unoptimized loading="eager" decoding="async" className="object-contain p-1.5" sizes="(max-width: 640px) 45vw, 240px" /></span> : <span className="max-w-full break-words text-[clamp(.85rem,2.6vw,2rem)] leading-tight [overflow-wrap:anywhere]">{card.word}</span>}
                  {card.status === "correct" && <Check className="absolute right-2 top-2 z-10 size-5 rounded-full bg-emerald-600 p-0.5 text-white" />}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="h-[min(94dvh,52rem)] w-[calc(100vw-1rem)] max-w-none grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden border-0 p-0 duration-0 sm:w-[min(92vw,68rem)] sm:max-w-[68rem] sm:rounded-[2rem]">
          <div className="bg-muted/65 px-6 py-5 sm:px-10 sm:py-6"><DialogHeader><DialogTitle className="flex items-center justify-center gap-2 text-base text-primary sm:text-lg"><Sparkles className="size-5" /> {activeCard?.imageUrl ? "รูปนี้คืออะไร" : "อ่านคำนี้ให้ฟังหน่อย"}</DialogTitle><DialogDescription className="text-center sm:text-base">ป้ายหมายเลข {activeCard?.id}</DialogDescription></DialogHeader></div>
          <div className="grid min-h-0 min-w-0 place-items-center overflow-hidden px-5 py-5 sm:px-10 sm:py-8">
            {activeCard?.imageUrl ? <div className="relative size-full min-h-0"><Image src={activeCard.imageUrl} alt={activeCard.word} fill unoptimized loading="eager" decoding="sync" className="object-contain" sizes="(max-width: 640px) 96vw, (max-width: 1280px) 92vw, 1088px" /></div> : <AutoFitWord word={activeCard?.word ?? ""} />}
          </div>
          <div className="grid grid-cols-2 gap-3 border-t bg-muted/35 p-4 sm:gap-5 sm:p-6"><Button className="h-12 bg-emerald-600 text-base hover:bg-emerald-700 sm:h-14 sm:text-lg" onClick={() => mark("correct")}><Check className="mr-2 size-5" /> {activeCard?.imageUrl ? "ถูก" : "อ่านถูก"}</Button><Button variant="outline" className="h-12 border-amber-400 bg-amber-400/10 text-base text-foreground hover:bg-amber-400/20 sm:h-14 sm:text-lg" onClick={() => mark("retry")}><RotateCcw className="mr-2 size-4" /> ผิด</Button></div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
