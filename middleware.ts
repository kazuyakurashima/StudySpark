import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // セッションがある場合、ユーザーのオンボーディング状態を確認
  if (session) {
    // ユーザーデータを取得
    const { data: userData, error } = await supabase
      .from('users')
      .select('onboarding_completed, avatar_key, display_name')
      .eq('id', session.user.id)
      .single();

    // ユーザーデータがあり、オンボーディングが完了していない場合
    // または avatar_key や display_name が設定されていない場合
    if (
      userData && 
      (!userData.onboarding_completed || !userData.avatar_key || !userData.display_name || userData.display_name === '名前未設定')
    ) {
      // オンボーディングページへのアクセスでない場合はリダイレクト
      if (
        !request.nextUrl.pathname.startsWith('/onboarding') &&
        !request.nextUrl.pathname.startsWith('/auth')
      ) {
        // アバターが未設定の場合はアバター選択ページへ
        if (!userData.avatar_key) {
          const redirectUrl = new URL('/onboarding', request.url);
          return NextResponse.redirect(redirectUrl);
        }
        // 名前が未設定の場合は名前入力ページへ
        else if (!userData.display_name || userData.display_name === '名前未設定') {
          const redirectUrl = new URL('/onboarding/name', request.url);
          return NextResponse.redirect(redirectUrl);
        }
        // その他のオンボーディング未完了の場合は最初のページへ
        else {
          const redirectUrl = new URL('/onboarding', request.url);
          return NextResponse.redirect(redirectUrl);
        }
      }
    }
  }

  // 保護されたルートの場合はログインを要求
  if (!session && (
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/onboarding')
  )) {
    const redirectUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // ログイン済みの場合は認証ページへのアクセスを防ぐ
  if (session && (
    request.nextUrl.pathname.startsWith('/auth/login') ||
    request.nextUrl.pathname.startsWith('/auth/register')
  )) {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// 認証チェックを適用するパス（ここに指定したパスにのみmiddlewareが実行される）
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/auth/:path*',
    '/onboarding/:path*',
    '/',
    '/spark/:path*',
    '/talk/:path*'
  ],
}; 