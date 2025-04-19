import { redirect } from 'next/navigation';
import { AvatarSelection } from "@/components/onboarding/avatar-selection";
import { createServerSupabaseClient } from '@/utils/supabase-server';

export default async function AvatarPage() {
  console.log("➡️ /onboarding/avatar ページサーバーコンポーネント実行開始");
  
  // サーバーサイドのSupabaseクライアントを作成
  const supabase = await createServerSupabaseClient();

  console.log("⏳ Supabaseクライアント作成完了、ユーザー取得試行...");
  const { data: { user }, error: getUserError } = await supabase.auth.getUser();

  if (getUserError) {
      console.error("❌ supabase.auth.getUser() でエラーが発生しました:", getUserError);
  }

  if (!user) {
    console.log(`⚠️ ユーザー認証情報なし (getUserError: ${getUserError?.message})。ログインページへリダイレクトします。`);
    redirect('/auth/login');
  }
  
  console.log(`✅ ユーザー認証済み: ${user.id}。AvatarSelection をレンダリングします。`);
  return <AvatarSelection />;
} 