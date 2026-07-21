"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type WheelItem = {
  id: number;
  word: string;
};

const wheelColors = [
  "#2563eb",
  "#db2777",
  "#7c3aed",
  "#059669",
  "#ea580c",
  "#0891b2",
  "#c026d3",
  "#65a30d",
  "#dc2626",
  "#4f46e5",
  "#0d9488",
  "#d97706",
];

function truncateLabel(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length)}…` : value;
}

export function SpinningWheel({
  items,
  totalCount,
  onResult,
  onRestoreAll,
}: {
  items: WheelItem[];
  totalCount: number;
  onResult: (id: number) => void;
  onRestoreAll: () => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const removedCount = totalCount - items.length;
  const sliceAngle = items.length ? 360 / items.length : 360;

  const colorGradient = useMemo(() => {
    if (!items.length) return "conic-gradient(#e2e8f0 0deg 360deg)";
    const stops = items.map((item, index) => {
      const start = index * sliceAngle;
      const end = (index + 1) * sliceAngle;
      return `${wheelColors[item.id % wheelColors.length]} ${start}deg ${end}deg`;
    });
    return `conic-gradient(from 0deg, ${stops.join(", ")})`;
  }, [items, sliceAngle]);

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  function spin() {
    if (spinning || !items.length) return;
    const selectedIndex = Math.floor(Math.random() * items.length);
    const selected = items[selectedIndex];
    const currentAngle = ((rotation % 360) + 360) % 360;
    const targetAngle = (360 - (selectedIndex + 0.5) * sliceAngle) % 360;
    const alignment = (targetAngle - currentAngle + 360) % 360;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 80 : 4200;

    setSpinning(true);
    setRotation((current) => current + (reduceMotion ? 0 : 6 * 360) + alignment);
    timeoutRef.current = window.setTimeout(() => {
      setSpinning(false);
      onResult(selected.id);
    }, duration);
  }

  if (!items.length) {
    return (
      <section className="grid min-h-[65vh] place-items-center rounded-[2rem] border bg-background p-6 text-center shadow-sm">
        <div>
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-primary/10 text-primary"><Sparkles className="size-9" /></span>
          <h2 className="mt-5 text-2xl font-bold">สุ่มครบทุกคำแล้ว</h2>
          <p className="mt-2 text-muted-foreground">คำถูกนำออกเฉพาะรอบนี้ ข้อมูลชุดคำเดิมยังอยู่ครบ</p>
          <Button type="button" size="lg" className="mt-6 rounded-full" onClick={onRestoreAll}><RotateCcw className="mr-2 size-5" /> เริ่มรอบใหม่</Button>
        </div>
      </section>
    );
  }

  const showLabels = items.length <= 36;
  const labelRadius = items.length <= 6 ? 135 : items.length <= 12 ? 165 : 185;
  const labelSize = items.length <= 4 ? 23 : items.length <= 8 ? 17 : items.length <= 16 ? 13 : 10;
  const labelLength = items.length <= 6 ? 14 : items.length <= 12 ? 10 : 6;

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
      <div className="rounded-[2rem] border bg-background p-4 shadow-sm sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full px-3 py-1.5">ในวงล้อ {items.length} คำ</Badge>
            {removedCount > 0 && <Badge variant="secondary" className="rounded-full px-3 py-1.5">นำออกแล้ว {removedCount}</Badge>}
          </div>
          {removedCount > 0 && <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onRestoreAll}><RotateCcw className="mr-1.5 size-4" /> คืนทุกคำ</Button>}
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[min(78vw,38rem)] select-none">
          <div className="absolute left-1/2 top-[-0.2rem] z-20 -translate-x-1/2 drop-shadow-lg" aria-hidden="true">
            <div className="h-0 w-0 border-x-[18px] border-t-[34px] border-x-transparent border-t-amber-400 sm:border-x-[24px] sm:border-t-[44px]" />
          </div>
          <button
            type="button"
            className="absolute inset-3 overflow-hidden rounded-full border-[6px] border-background shadow-[0_18px_55px_rgba(15,23,42,0.25)] outline-none ring-4 ring-primary/15 focus-visible:ring-8 focus-visible:ring-primary/30 disabled:cursor-wait sm:inset-5 sm:border-[10px]"
            onClick={spin}
            disabled={spinning}
            aria-label={spinning ? "กำลังหมุนวงล้อ" : `หมุนวงล้อที่มี ${items.length} คำ`}
          >
            <span
              className="absolute inset-0 block rounded-full will-change-transform"
              style={{
                backgroundImage: colorGradient,
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? "transform 4.2s cubic-bezier(.12,.72,.08,1)" : "none",
              }}
            >
              {showLabels && (
                <svg viewBox="0 0 500 500" className="size-full" aria-hidden="true">
                  {items.map((item, index) => {
                    const angle = (index + 0.5) * sliceAngle - 90;
                    const radians = angle * Math.PI / 180;
                    const x = 250 + Math.cos(radians) * labelRadius;
                    const y = 250 + Math.sin(radians) * labelRadius;
                    return (
                      <text key={item.id} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={labelSize} fontWeight="700" paintOrder="stroke" stroke="rgb(15 23 42 / 0.28)" strokeWidth="2">
                        {truncateLabel(item.word, labelLength)}
                      </text>
                    );
                  })}
                </svg>
              )}
            </span>
            <span className="absolute left-1/2 top-1/2 z-10 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white/80 bg-slate-950 text-sm font-bold text-white shadow-xl sm:size-28 sm:text-lg">
              {spinning ? "กำลังหมุน" : "กดหมุน"}
            </span>
          </button>
        </div>

        <Button type="button" size="lg" className="mx-auto mt-5 flex min-w-48 rounded-full text-base shadow-lg shadow-primary/20" onClick={spin} disabled={spinning}>
          <Sparkles className={`mr-2 size-5 ${spinning ? "animate-spin" : ""}`} /> {spinning ? "กำลังสุ่ม..." : "หมุนวงล้อ"}
        </Button>
      </div>

      <aside className="rounded-[2rem] border bg-background p-5 shadow-sm">
        <h2 className="font-bold">คำที่อยู่ในวงล้อ</h2>
        <p className="mt-1 text-xs text-muted-foreground">เลือกหลังหมุนได้ว่าจะเก็บไว้หรือเอาออกจากรอบนี้</p>
        <ol className="mt-4 max-h-[32rem] space-y-2 overflow-y-auto pr-1">
          {items.map((item, index) => (
            <li key={item.id} className="flex min-w-0 items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5 text-sm">
              <span className="grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: wheelColors[item.id % wheelColors.length] }}>{index + 1}</span>
              <span className="min-w-0 break-words font-medium [overflow-wrap:anywhere]">{item.word}</span>
            </li>
          ))}
        </ol>
      </aside>
    </section>
  );
}
