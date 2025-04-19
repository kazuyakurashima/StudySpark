import { createBrowserClient } from '@supabase/ssr';

// Supabaseの接続情報を環境変数から取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ブラウザ環境用のSupabaseクライアントを作成
export const supabase = createBrowserClient(
  supabaseUrl, 
  supabaseAnonKey
); 