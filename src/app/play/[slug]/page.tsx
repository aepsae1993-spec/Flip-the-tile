import type { Metadata } from "next";
import { GameBoard } from "@/components/game-board";

export const metadata: Metadata = { title: "เล่นเกม" };

export default async function PlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <GameBoard slug={slug} />;
}
