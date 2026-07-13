import Link from "next/link";
import { BookOpen, Play } from "lucide-react";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("id,display_name,username,school_name,bio").eq("username", username).eq("is_public", true).maybeSingle();
  if (!profile) notFound();
  const { data: sets } = await supabase.from("word_sets").select("id,title,description,public_slug,word_cards(count)").eq("teacher_id", profile.id).eq("is_published", true).order("created_at", { ascending: false });
  return <main className="min-h-screen bg-muted/35"><header className="border-b bg-background"><div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6"><BrandLogo /></div></header><div className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><section className="rounded-3xl bg-primary p-7 text-primary-foreground"><Badge variant="secondary">โปรไฟล์ครู</Badge><h1 className="mt-4 text-3xl font-bold">{profile.display_name}</h1>{profile.school_name && <p className="mt-2 text-blue-100">{profile.school_name}</p>}{profile.bio && <p className="mt-4 max-w-2xl leading-7 text-blue-50">{profile.bio}</p>}</section><div className="mt-8"><h2 className="text-xl font-bold">ชุดคำสาธารณะ</h2>{!sets?.length ? <Card className="mt-4"><CardContent className="py-10 text-center text-muted-foreground"><BookOpen className="mx-auto mb-3 size-8" />ยังไม่มีชุดคำที่เผยแพร่</CardContent></Card> : <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{sets.map((set) => <Card key={set.id}><CardContent className="p-5"><h3 className="font-semibold">{set.title}</h3><p className="mt-1 text-sm text-muted-foreground">{set.word_cards?.[0]?.count ?? 0} คำ</p><Button asChild className="mt-5 w-full"><Link href={`/play/${set.public_slug}`}><Play className="mr-2 size-4" />เปิดเล่น</Link></Button></CardContent></Card>)}</div>}</div></div></main>;
}
