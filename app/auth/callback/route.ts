import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    
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

    await supabase.auth.exchangeCodeForSession(code);
    
    try {
      // 認証が完了したユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // ユーザーのプロフィール情報を取得
        const { data: userData, error } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();
        
        // オンボーディング完了状態をチェック
        if (userData && userData.onboarding_completed) {
          // オンボーディング完了済みならホームページへ
          return NextResponse.redirect(new URL('/home', request.url));
        } else {
          // オンボーディング未完了なら名前入力ページへ
          // avatarページは存在しない可能性があるため、nameページに変更
          return NextResponse.redirect(new URL('/onboarding/name', request.url));
        }
      }
    } catch (error) {
      console.error('Error checking user onboarding status:', error);
    }
  }

  // ユーザー情報が取得できない場合はログインページへ
  return NextResponse.redirect(new URL('/auth/login', request.url));
} 