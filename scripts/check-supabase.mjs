import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  console.error("SUPABASE_ENV_MISSING");
  process.exit(1);
}

const supabase = createClient(url, publishableKey);
const { data, error } = await supabase.from("word_sets").select("id").limit(1);

if (error) {
  console.error(`DATA_API_ERROR:${error.code}`);
  process.exit(1);
}

console.log(`DATA_API_OK rows=${data.length}`);
