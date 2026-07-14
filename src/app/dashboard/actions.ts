"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type WordSetShare = {
  id: string;
  recipientEmail: string;
};

export async function shareWordSetAction(wordSetId: string, email: string) {
  await requireApprovedUser();
  const normalizedEmail = email.trim().toLowerCase();
  if (!wordSetId || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return { error: "กรุณากรอกอีเมลสมาชิกให้ถูกต้อง" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("share_word_set_with_member", {
    p_word_set_id: wordSetId,
    p_recipient_email: normalizedEmail,
  });

  if (error || !data) {
    if (error?.message.includes("MEMBER_NOT_FOUND")) {
      return { error: "ไม่พบสมาชิกที่ได้รับอนุมัติด้วยอีเมลนี้" };
    }
    if (error?.message.includes("CANNOT_SHARE_WITH_SELF")) {
      return { error: "ไม่สามารถแชร์ชุดคำให้บัญชีของตัวเองได้" };
    }
    if (error?.message.includes("SET_NOT_OWNED")) {
      return { error: "คุณไม่มีสิทธิ์แชร์ชุดคำนี้" };
    }
    return { error: "แชร์ชุดคำไม่สำเร็จ กรุณาลองใหม่" };
  }

  revalidatePath("/dashboard");
  return {
    share: {
      id: String(data),
      recipientEmail: normalizedEmail,
    } satisfies WordSetShare,
  };
}

export async function removeWordSetShareAction(shareId: string) {
  const account = await requireApprovedUser();
  if (!shareId) return { error: "ไม่พบรายการแชร์" };

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("word_set_shares")
    .delete({ count: "exact" })
    .eq("id", shareId)
    .eq("owner_id", account.user.id);

  if (error || count !== 1) {
    return { error: "ยกเลิกการแชร์ไม่สำเร็จ กรุณาลองใหม่" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
