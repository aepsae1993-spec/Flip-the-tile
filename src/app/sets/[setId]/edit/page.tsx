import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CreateSetForm } from "@/components/create-set-form";
import { ThemeSwitcher } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { requireApprovedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "แก้ไขชุดคำ" };

export default async function EditSetPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  const account = await requireApprovedUser();
  const supabase = await createClient();
  const { data: set } = await supabase
    .from("word_sets")
    .select("id,title,description,grade_min,grade_max,content_type")
    .eq("id", setId)
    .eq("teacher_id", account.user.id)
    .maybeSingle();
  if (!set) notFound();

  const { data: cards } = await supabase
    .from("word_cards")
    .select("word_text,image_url,position")
    .eq("word_set_id", set.id)
    .order("position");
  if (!cards?.length) notFound();

  const grade = set.description?.replace(/^ระดับชั้น\s*/, "")
    || (set.grade_min && set.grade_max ? `ป.${set.grade_min}–${set.grade_max}` : "ไม่ระบุ");

  return (
    <main className="min-h-screen bg-muted/35">
      <header className="border-b bg-background"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"><BrandLogo /><div className="flex items-center gap-2"><ThemeSwitcher compact /><Button asChild variant="ghost" size="sm"><Link href="/dashboard"><ChevronLeft className="mr-1 size-4" /> แดชบอร์ด</Link></Button></div></div></header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-7"><p className="text-sm font-semibold text-primary">จัดการชุดคำ</p><h1 className="mt-1 text-3xl font-bold tracking-tight">แก้ไขชุดคำ</h1><p className="mt-2 text-muted-foreground">ปรับชื่อ ระดับชั้น จำนวนป้าย และรายการคำได้ที่นี่</p></div>
        <CreateSetForm initialSet={{ id: set.id, title: set.title, grade, contentType: set.content_type === "image" ? "image" : "word", cards: cards.map((card) => ({ wordText: card.word_text, imageUrl: card.image_url })) }} />
      </div>
    </main>
  );
}
