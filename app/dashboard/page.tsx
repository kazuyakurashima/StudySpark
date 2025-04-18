import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function DashboardPage() {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="mt-2 text-gray-600">
          ようこそ{user?.email ? ` ${user.email}` : ''}さん！
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">今日の学習</h2>
          <p className="text-gray-600">今日の学習目標を追加して、進捗を追跡しましょう。</p>
          <div className="mt-4">
            <Link
              href="/study/today"
              className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              学習開始
            </Link>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">週間レポート</h2>
          <p className="text-gray-600">先週の学習状況を振り返りましょう。</p>
          <div className="mt-4">
            <Link
              href="/reports/weekly"
              className="inline-block rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              レポート確認
            </Link>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">学習資料</h2>
          <p className="text-gray-600">おすすめの学習リソースやメモを確認しましょう。</p>
          <div className="mt-4">
            <Link
              href="/resources"
              className="inline-block rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              資料を見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 