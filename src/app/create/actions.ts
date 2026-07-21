"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type SetContentType = "word" | "image";
export type SetCardInput = { wordText: string; imageUrl: string | null };
export type CreateSetInput = {
  title: string;
  grade: string;
  contentType: SetContentType;
  cards: SetCardInput[];
};

function gradeRange(value: string) {
  const numbers = value.match(/\d+/g)?.map(Number) ?? [];
  if (!numbers.length) return { grade_min: null, grade_max: null };
  return { grade_min: Math.min(...numbers), grade_max: Math.max(...numbers) };
}

function cardImagePath(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const projectOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
      : "";
    if (!projectOrigin || url.origin !== projectOrigin) return null;
    const marker = "/storage/v1/object/public/card-images/";
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex < 0) return null;
    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

function normalizeCards(input: CreateSetInput, userId: string) {
  if (!(["word", "image"] as string[]).includes(input.contentType)) return null;
  if (input.cards.length < 2) return null;

  const cards = input.cards.map((card, index) => ({
    wordText: card.wordText.trim().slice(0, 160) || (input.contentType === "image" ? `รูปที่ ${index + 1}` : ""),
    imageUrl: input.contentType === "image" ? card.imageUrl : null,
  }));
  if (input.contentType === "word" && cards.some((card) => !card.wordText)) return null;
  if (input.contentType === "image" && cards.some((card) => {
    const path = cardImagePath(card.imageUrl);
    return !path || !path.startsWith(`${userId}/`);
  })) return null;
  return cards;
}

async function removeUnusedImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  oldUrls: Array<string | null>,
  keepUrls: Array<string | null>,
) {
  const keepPaths = new Set(keepUrls.map(cardImagePath).filter((path): path is string => Boolean(path)));
  const removePaths = oldUrls
    .map(cardImagePath)
    .filter((path): path is string => path !== null && !keepPaths.has(path));
  if (removePaths.length) await supabase.storage.from("card-images").remove(removePaths);
}

export async function createWordSetAction(input: CreateSetInput) {
  const account = await requireApprovedUser();
  const title = input.title.trim();
  const cards = normalizeCards(input, account.user.id);
  if (!title || title.length > 120 || !cards) return { error: "กรุณากรอกข้อมูลชุดป้ายให้ครบถ้วน" };

  const supabase = await createClient();
  const slug = `${account.profile?.username ?? "set"}-${crypto.randomUUID().slice(0, 8)}`;
  const { data: set, error: setError } = await supabase
    .from("word_sets")
    .insert({
      teacher_id: account.user.id,
      title,
      description: `ระดับชั้น ${input.grade}`,
      subject: input.contentType === "image" ? "รูปภาพ" : "ภาษาไทย",
      ...gradeRange(input.grade),
      theme_key: "sky",
      content_type: input.contentType,
      is_published: true,
      public_slug: slug,
    })
    .select("id,public_slug")
    .single();
  if (setError || !set) return { error: "บันทึกชุดป้ายไม่สำเร็จ กรุณาลองใหม่" };

  const { error: cardsError } = await supabase.from("word_cards").insert(cards.map((card, index) => ({
    word_set_id: set.id,
    position: index + 1,
    word_text: card.wordText,
    image_url: card.imageUrl,
  })));
  if (cardsError) {
    await supabase.from("word_sets").delete().eq("id", set.id);
    return { error: "บันทึกข้อมูลป้ายไม่ครบ ระบบยกเลิกรายการแล้ว กรุณาลองใหม่" };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/play/${set.public_slug}`);
  return { slug: set.public_slug };
}

export async function updateWordSetAction(input: CreateSetInput & { id: string }) {
  const account = await requireApprovedUser();
  const title = input.title.trim();
  const cards = normalizeCards(input, account.user.id);
  if (!input.id || !title || title.length > 120 || !cards) return { error: "กรุณากรอกข้อมูลชุดป้ายให้ครบถ้วน" };

  const supabase = await createClient();
  const { data: oldCards } = await supabase
    .from("word_cards")
    .select("image_url")
    .eq("word_set_id", input.id);
  const { data: set, error: setError } = await supabase
    .from("word_sets")
    .update({
      title,
      description: `ระดับชั้น ${input.grade}`,
      subject: input.contentType === "image" ? "รูปภาพ" : "ภาษาไทย",
      content_type: input.contentType,
      ...gradeRange(input.grade),
    })
    .eq("id", input.id)
    .eq("teacher_id", account.user.id)
    .select("id,public_slug")
    .maybeSingle();
  if (setError || !set) return { error: "แก้ไขชุดป้ายไม่สำเร็จ หรือคุณไม่มีสิทธิ์แก้ไขชุดนี้" };

  const { error: cardsError } = await supabase.from("word_cards").upsert(
    cards.map((card, index) => ({
      word_set_id: set.id,
      position: index + 1,
      word_text: card.wordText,
      image_url: card.imageUrl,
    })),
    { onConflict: "word_set_id,position" },
  );
  if (cardsError) return { error: "แก้ไขข้อมูลป้ายไม่ครบ กรุณาลองใหม่" };

  const { error: trimError } = await supabase
    .from("word_cards")
    .delete()
    .eq("word_set_id", set.id)
    .gt("position", cards.length);
  if (trimError) return { error: "ลบป้ายส่วนเกินไม่สำเร็จ กรุณาลองใหม่" };

  await removeUnusedImages(
    supabase,
    (oldCards ?? []).map((card) => card.image_url),
    cards.map((card) => card.imageUrl),
  );
  revalidatePath("/dashboard");
  revalidatePath(`/play/${set.public_slug}`);
  return { slug: set.public_slug };
}

export async function deleteWordSetAction(id: string) {
  const account = await requireApprovedUser();
  if (!id) return { error: "ไม่พบชุดป้ายที่ต้องการลบ" };

  const supabase = await createClient();
  const { data: cards } = await supabase.from("word_cards").select("image_url").eq("word_set_id", id);
  const { error, count } = await supabase
    .from("word_sets")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("teacher_id", account.user.id);
  if (error || count !== 1) return { error: "ลบชุดป้ายไม่สำเร็จ หรือคุณไม่มีสิทธิ์ลบชุดนี้" };

  await removeUnusedImages(supabase, (cards ?? []).map((card) => card.image_url), []);
  revalidatePath("/dashboard");
  return { success: true };
}
