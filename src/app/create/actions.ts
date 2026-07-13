"use server";

import { requireApprovedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type CreateSetInput = { title: string; grade: string; words: string[] };

function gradeRange(value: string) {
  const numbers = value.match(/\d+/g)?.map(Number) ?? [];
  if (!numbers.length) return { grade_min: null, grade_max: null };
  return { grade_min: Math.min(...numbers), grade_max: Math.max(...numbers) };
}

export async function createWordSetAction(input: CreateSetInput) {
  const account = await requireApprovedUser();
  const title = input.title.trim();
  const words = input.words.map((word) => word.trim()).filter(Boolean);
  if (!title || words.length < 2 || words.length > 100) return { error: "กรุณากรอกชื่อและคำจำนวน 2–100 คำ" };

  const supabase = await createClient();
  const slug = `${account.profile?.username ?? "set"}-${crypto.randomUUID().slice(0, 8)}`;
  const { data: set, error: setError } = await supabase
    .from("word_sets")
    .insert({ teacher_id: account.user.id, title, description: `ระดับชั้น ${input.grade}`, subject: "ภาษาไทย", ...gradeRange(input.grade), theme_key: "sky", is_published: true, public_slug: slug })
    .select("id,public_slug")
    .single();
  if (setError || !set) return { error: "บันทึกชุดคำไม่สำเร็จ กรุณาลองใหม่" };

  const { error: cardsError } = await supabase.from("word_cards").insert(words.map((word_text, index) => ({ word_set_id: set.id, position: index + 1, word_text })));
  if (cardsError) {
    await supabase.from("word_sets").delete().eq("id", set.id);
    return { error: "บันทึกคำไม่ครบ ระบบยกเลิกรายการแล้ว กรุณาลองใหม่" };
  }
  return { slug: set.public_slug };
}
