// src/lib/supabaseClient.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// 環境変数が確実に設定されていることを確認
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};