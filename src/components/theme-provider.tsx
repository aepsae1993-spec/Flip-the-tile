"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Check, Gem, Moon, Palette, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Theme = "light" | "dark" | "luxury";

const themes: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: "light", label: "สว่าง", icon: Sun },
  { value: "dark", label: "มืด", icon: Moon },
  { value: "luxury", label: "หรูหรา", icon: Gem },
];

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove("dark", "luxury");
  if (theme !== "light") document.documentElement.classList.add(theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return children;
}

export function useTheme() {
  const theme = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("wordflip-theme-change", onChange);
      return () => window.removeEventListener("wordflip-theme-change", onChange);
    },
    () => {
      const saved = window.sessionStorage.getItem("wordflip-theme");
      return saved === "dark" || saved === "luxury" ? saved : "light";
    },
    () => "light" as Theme,
  );

  useEffect(() => applyTheme(theme), [theme]);

  function setTheme(theme: Theme) {
    window.sessionStorage.setItem("wordflip-theme", theme);
    applyTheme(theme);
    window.dispatchEvent(new Event("wordflip-theme-change"));
  }

  return { theme, setTheme };
}

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={compact ? "icon" : "sm"} aria-label="เลือกธีม">
          <Palette className={compact ? "size-4" : "mr-1 size-4"} />
          {!compact && "ธีม"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel>รูปแบบหน้าจอ</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem key={item.value} onSelect={() => setTheme(item.value)} className="py-2">
              <Icon className="size-4" />
              {item.label}
              {theme === item.value && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
