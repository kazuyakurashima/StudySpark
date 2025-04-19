import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  console.log("🔄 コールバックルート実行中: コード取得状態", code ? "成功" : "失敗");

  if (code) {
    try {
      const cookieStore = await cookies();
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              cookieStore.set({ name, value, ...options });
            },
            remove(name: string, options: any) {
              cookieStore.delete({ name, ...options });
            },
          },
        }
      );

      console.log("⏳ コードをセッションに交換します...");
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("❌ セッション交換エラー:", error.message);
        return NextResponse.redirect(new URL('/auth/login?error=session_exchange', request.url));
      }
      
      console.log("✅ セッション交換成功:", data.session ? "セッション取得" : "セッションなし");
      
      // ユーザー情報を取得し、オンボーディング状態をチェック
      if (data.session) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("❌ ユーザー取得エラー:", userError.message);
          return NextResponse.redirect(new URL('/auth/login?error=user_fetch', request.url));
        }
        
        if (user) {
          try {
            console.log(`🔍 ユーザーID ${user.id} のオンボーディング状態を確認します...`);
            const { data: userData, error: userDataError } = await supabase
              .from('users')
              .select('onboarding_completed')
              .eq('id', user.id)
              .single();
              
            if (userDataError && userDataError.code !== 'PGRST116') {
              console.error("❌ ユーザーデータ取得エラー:", userDataError.message);
              // エラーでもオンボーディングに進める
            }
            
            console.log("📊 ユーザーデータ:", userData);
            
            if (userData && userData.onboarding_completed) {
              console.log("🏠 オンボーディング完了済み -> /dashboard へリダイレクト");
              return NextResponse.redirect(new URL('/dashboard', request.url));
            } else {
              console.log("🚀 オンボーディング未完了 -> /onboarding/avatar へリダイレクト");
              return NextResponse.redirect(new URL('/onboarding/avatar', request.url));
            }
          } catch (e) {
            console.error("❌ ユーザーデータ処理エラー:", e);
            // エラーが発生してもオンボーディングに進める
            return NextResponse.redirect(new URL('/onboarding/avatar', request.url));
          }
        }
      }
    } catch (e) {
      console.error("❌ 全体的な処理エラー:", e);
      return NextResponse.redirect(new URL('/auth/login?error=unexpected', request.url));
    }
  }

  console.log("⚠️ 適切なリダイレクト先が決定できなかったため、デフォルトでオンボーディングへリダイレクトします");
  // デフォルトはオンボーディングへ
  return NextResponse.redirect(new URL('/onboarding/avatar', request.url));
} 