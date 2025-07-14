import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// 追加 ↓ SSR対応用などで createClient を使いたいとき用
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
