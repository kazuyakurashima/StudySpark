import { AvatarSelection } from "@/components/onboarding/avatar-selection";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AvatarPage() {
  console.log("➡️ /onboarding/avatar ページサーバーコンポーネント実行開始");
  
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // set/remove はサーバーコンポーネントでは通常不要
      },
    }
  );

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