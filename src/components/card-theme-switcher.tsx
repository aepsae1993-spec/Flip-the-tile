"use client";

import { useSyncExternalStore } from "react";
import { Check, PanelsTopLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type CardThemeKey = "sky" | "forest" | "ocean" | "candy" | "space" | "gold";

export const cardThemes: Record<CardThemeKey, {
  label: string;
  front: string;
  decoration: string;
  back: string;
  swatch: string;
}> = {
  sky: {
    label: "ท้องฟ้าใส",
    front: "border-sky-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 text-blue-700 shadow-sky-200/60",
    decoration: "bg-sky-200/55",
    back: "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white",
    swatch: "from-sky-300 to-blue-600",
  },
  forest: {
    label: "ป่ามรกต",
    front: "border-emerald-300 bg-gradient-to-br from-emerald-50 via-lime-50 to-emerald-200 text-emerald-800 shadow-emerald-200/60",
    decoration: "bg-emerald-300/45",
    back: "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-800 text-white",
    swatch: "from-lime-300 to-emerald-700",
  },
  ocean: {
    label: "มหาสมุทร",
    front: "border-cyan-300 bg-gradient-to-br from-cyan-50 via-sky-100 to-cyan-200 text-cyan-900 shadow-cyan-200/60",
    decoration: "bg-cyan-300/50",
    back: "bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-800 text-white",
    swatch: "from-cyan-300 to-blue-700",
  },
  candy: {
    label: "ลูกกวาดพาสเทล",
    front: "border-pink-200 bg-gradient-to-br from-rose-50 via-pink-100 to-violet-100 text-fuchsia-800 shadow-pink-200/60",
    decoration: "bg-pink-300/45",
    back: "bg-gradient-to-br from-pink-400 via-fuchsia-500 to-violet-600 text-white",
    swatch: "from-pink-300 to-violet-600",
  },
  space: {
    label: "จักรวาล",
    front: "border-violet-500/60 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-violet-100 shadow-violet-950/50",
    decoration: "bg-violet-400/25",
    back: "bg-gradient-to-br from-violet-600 via-indigo-700 to-slate-950 text-white",
    swatch: "from-violet-500 to-slate-950",
  },
  gold: {
    label: "ดำ–ทองหรูหรา",
    front: "border-amber-400/70 bg-gradient-to-br from-neutral-950 via-zinc-900 to-amber-950 text-amber-300 shadow-amber-950/60",
    decoration: "bg-amber-400/20",
    back: "border border-amber-400/60 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-neutral-950",
    swatch: "from-neutral-950 via-amber-950 to-amber-500",
  },
};

const themeKeys = Object.keys(cardThemes) as CardThemeKey[];

function getCardTheme(): CardThemeKey {
  const saved = window.sessionStorage.getItem("wordflip-card-theme");
  return themeKeys.includes(saved as CardThemeKey) ? saved as CardThemeKey : "sky";
}

function subscribe(onChange: () => void) {
  window.addEventListener("wordflip-card-theme-change", onChange);
  return () => window.removeEventListener("wordflip-card-theme-change", onChange);
}

export function useCardTheme() {
  const themeKey = useSyncExternalStore(subscribe, getCardTheme, () => "sky" as CardThemeKey);

  function setTheme(theme: CardThemeKey) {
    window.sessionStorage.setItem("wordflip-card-theme", theme);
    window.dispatchEvent(new Event("wordflip-card-theme-change"));
  }

  return { themeKey, theme: cardThemes[themeKey], setTheme };
}

export function CardThemeSwitcher() {
  const { themeKey, setTheme } = useCardTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full" aria-label="เลือกธีมแผ่นป้าย">
          <PanelsTopLeft className="mr-1 size-4" /> ป้าย
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>ธีมแผ่นป้าย</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themeKeys.map((key) => (
          <DropdownMenuItem key={key} onSelect={() => setTheme(key)} className="gap-3 py-2.5">
            <span className={`size-7 rounded-lg border border-white/20 bg-gradient-to-br shadow-sm ${cardThemes[key].swatch}`} />
            <span>{cardThemes[key].label}</span>
            {themeKey === key && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
