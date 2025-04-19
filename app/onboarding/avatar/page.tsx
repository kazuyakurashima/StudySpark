// /app/onboarding/avatar/page.tsx (一時的なデバッグ用)
import { AvatarSelection } from "@/components/onboarding/avatar-selection";
// import { createServerClient, type CookieOptions } from '@supabase/ssr'; // コメントアウト
// import { cookies } from 'next/headers'; // コメントアウト
// import { redirect } from 'next/navigation'; // コメントアウト

export default async function AvatarPage() {
  console.log("➡️ /onboarding/avatar ページサーバーコンポーネント実行開始 (Supabaseロジック削除)");
  
  // --- Supabase関連の処理をすべてコメントアウト --- 
  /*
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
    // redirect('/auth/login'); // リダイレクトもコメントアウト
    // 代わりにエラー表示や何もしないなど、状況に応じて変更
    return <h1>認証エラー (デバッグ用)</h1>; 
  }
  
  console.log(`✅ ユーザー認証済み: ${user.id}。AvatarSelection をレンダリングします。`);
  // return <AvatarSelection userId={user.id} />;
  */
  
  // userIdをダミーで渡すか、AvatarSelectionのProps要件を一時的に外す
  // ここではAvatarSelectionを呼ばずに単純な要素を返す
  return <h1>アバター選択ページ (デバッグ表示)</h1>; 
} 