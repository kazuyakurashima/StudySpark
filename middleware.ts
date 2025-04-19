import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
// import { useRouter } from 'next/navigation'; // Middlewareでは使用できないため削除

export async function middleware(request: NextRequest) {
  console.log("--- Middleware Start ---");
  console.log(`
[Middleware] 🚀 Request Path: ${request.nextUrl.pathname}`);
  
  // 変更前の状態に戻す
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
        // 元の処理に戻す
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  console.log('[Middleware] ⏳ セッション取得試行...');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
      console.error('[Middleware] ❌ セッション取得エラー:', sessionError);
  }
  console.log(`[Middleware] 📊 セッション: ${session ? `あり (User ID: ${session.user.id})` : 'なし'}`);

  // --- セッションあり (ログイン済み) --- 
  if (session) {
    console.log('[Middleware] ⏳ usersテーブルからデータ取得試行...');
    const { data: userData, error } = await supabase
      .from('users')
      .select('onboarding_completed, avatar_key, display_name')
      .eq('id', session.user.id)
      .single();
    
    if (error || !userData) {
      console.error("❌ usersテーブルからのデータ取得エラー または データが存在しません:", error);
      // エラー時やユーザーデータがない場合はログインページへリダイレクト（あるいはエラーページ）
      return NextResponse.redirect(new URL('/auth/login?error=user_data_fetch_failed', request.url));
    }

    console.log("📊 [Middleware] 取得したユーザーデータ:", userData);

    // オンボーディング未完了判定
    const needsOnboarding = userData && 
      (!userData.onboarding_completed || !userData.avatar_key || !userData.display_name || userData.display_name === '名前未設定');
      
    console.log(`[Middleware] 🤔 オンボーディング必要か？: ${needsOnboarding}`);

    if (needsOnboarding) {
      const isOnboardingPath = request.nextUrl.pathname.startsWith('/onboarding');
      const isAuthPath = request.nextUrl.pathname.startsWith('/auth');
      console.log(`[Middleware]   現在のパスはオンボーディングか？: ${isOnboardingPath}`);
      console.log(`[Middleware]   現在のパスは認証か？: ${isAuthPath}`);

      // オンボーディングが必要なのに、オンボーディング/認証パスにいない場合
      if (!isOnboardingPath && !isAuthPath) {
        let redirectPath = '/onboarding'; // デフォルト
        if (!userData.avatar_key) {
          redirectPath = '/onboarding/avatar'; // アバター選択へ
          console.log('[Middleware] ➡️ アバター未設定のためリダイレクト:', redirectPath);
        } else if (!userData.display_name || userData.display_name === '名前未設定') {
          redirectPath = '/onboarding/name'; // 名前入力へ
           console.log('[Middleware] ➡️ 名前未設定のためリダイレクト:', redirectPath);
        } else {
            console.log('[Middleware] ➡️ その他のオンボーディング未完了のためリダイレクト:', redirectPath);
        }
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    // ログイン済みで認証ページにアクセスした場合
    if (
      request.nextUrl.pathname.startsWith('/auth/login') ||
      request.nextUrl.pathname.startsWith('/auth/register')
    ) {
      console.log('[Middleware] ➡️ ログイン済みで認証ページアクセス、/home へリダイレクト');
      return NextResponse.redirect(new URL('/home', request.url)); // /dashboardではなく/homeに修正
    }

    // onboarding_completedに基づいて適切なページにリダイレクト
    if (userData.onboarding_completed) {
      // 既にホームにいる場合は何もしない
      if (request.nextUrl.pathname === '/home') {
        console.log("🔄 [Middleware] 既にホームにいるためリダイレクト不要");
        return response;
      }
      console.log("🚀 [Middleware] オンボーディング完了済み -> /home へリダイレクト");
      return NextResponse.redirect(new URL('/home', request.url));
    } else {
      // 既にアバター選択にいる場合は何もしない
      if (request.nextUrl.pathname === '/onboarding/avatar') {
        console.log("🔄 [Middleware] 既にアバター選択にいるためリダイレクト不要");
        return response;
      }
      console.log("🚀 [Middleware] オンボーディング未完了 -> /onboarding/avatar へリダイレクト");
      return NextResponse.redirect(new URL('/onboarding/avatar', request.url));
    }

  // --- セッションなし (未ログイン) --- 
  } else {
    // 保護されたルートへのアクセスの場合
    if (
      request.nextUrl.pathname.startsWith('/dashboard') || // dashboardは存在するか？
      request.nextUrl.pathname.startsWith('/profile') ||
      request.nextUrl.pathname.startsWith('/onboarding') ||
      request.nextUrl.pathname.startsWith('/home') || // homeも保護
      request.nextUrl.pathname.startsWith('/spark') || // 保護対象に追加
      request.nextUrl.pathname.startsWith('/talk') || // 保護対象に追加
      request.nextUrl.pathname.startsWith('/goal') || // 保護対象に追加
      request.nextUrl.pathname.startsWith('/countdown') // 保護対象に追加
    ) {
      console.log(`[Middleware] ➡️ 未ログインで保護ルート (${request.nextUrl.pathname}) アクセス、/auth/login へリダイレクト`);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  console.log('[Middleware] ✅ チェック完了、次の処理へ');
  return response;
}

// config は変更なし
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public/images)
     * - icons (public/icons)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
}; 