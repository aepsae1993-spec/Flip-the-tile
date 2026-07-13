import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error("ระบบยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแล");
  return createBrowserClient(url, publishableKey);
}
