import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CreateSetForm } from "@/components/create-set-form";
import { Button } from "@/components/ui/button";
import { requireApprovedUser } from "@/lib/auth";
import { ThemeSwitcher } from "@/components/theme-provider";

export const metadata: Metadata = { title: "สร้างชุดป้าย" };

export default async function CreatePage() {
  await requireApprovedUser();
  return (
    <main className="min-h-screen bg-muted/35">
      <header className="border-b bg-background"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"><BrandLogo /><div className="flex items-center gap-2"><ThemeSwitcher compact /><Button asChild variant="ghost" size="sm"><Link href="/dashboard"><ChevronLeft className="mr-1 size-4" /> แดชบอร์ด</Link></Button></div></div></header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-7"><p className="text-sm font-semibold text-primary">สร้างเกมใหม่</p><h1 className="mt-1 text-3xl font-bold tracking-tight">สร้างชุดป้ายของคุณ</h1><p className="mt-2 text-muted-foreground">เลือกใช้คำหรือรูปภาพ กำหนดจำนวนแผ่น แล้วบันทึกไว้เล่นได้ทุกที่</p></div>
        <CreateSetForm />
      </div>
    </main>
  );
}
