import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameBoard } from "@/components/game-board";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "เล่นเกม" };

export default async function PlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: set } = await supabase.from("word_sets").select("id,title").eq("public_slug", slug).maybeSingle();
  if (!set) notFound();
  const { data: cards } = await supabase.from("word_cards").select("word_text,position").eq("word_set_id", set.id).order("position");
  if (!cards?.length) notFound();
  return <GameBoard title={set.title} words={cards.map((card) => card.word_text)} />;
}
