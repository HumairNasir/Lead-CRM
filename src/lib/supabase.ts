import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "placeholder-anon-key";

/**
 * Flag indicating whether real Supabase credentials have been configured
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url") &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your_supabase_url_here") &&
  !supabaseAnonKey.includes("placeholder-anon-key") &&
  !supabaseAnonKey.includes("your_supabase_anon_key_here")
);

/**
 * Shared Supabase Client instance powered by @supabase/ssr for automatic cookie synchronization
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
