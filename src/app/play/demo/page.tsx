import type { Metadata } from "next";
import { DemoGame } from "@/components/demo-game";

export const metadata: Metadata = { title: "โหมดทดลอง" };

export default function DemoPage() {
  return <DemoGame />;
}
