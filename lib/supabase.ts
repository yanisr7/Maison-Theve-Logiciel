import { createClient } from "@supabase/supabase-js";

// Client Supabase navigateur (clé publishable — sûre côté client).
// Variables dans .env.local (NEXT_PUBLIC_* exposées au navigateur, jamais commitées).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Supabase non configuré : renseigner NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY dans .env.local"
  );
}

export const supabase = createClient(url, key);
