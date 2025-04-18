'use client';

import Link from 'next/link';

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3 text-blue-500">
              <path d="M12 2L14.09 8.26L20.5 8.27L15.21 12.14L17.29 18.4L12 14.53L6.71 18.4L8.79 12.14L3.5 8.27L9.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="text-4xl font-bold text-blue-500">StudySpark</h1>
          </div>
          <p className="mt-3 text-lg text-gray-600">定期テストに向けて効果的に学習しよう</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8">
          <div className="text-center space-y-4">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-900">確認メールを送信しました</h2>
            <p className="text-gray-600">
              登録したメールアドレスに確認メールを送信しました。<br />
              メール内のリンクをクリックしてアカウントを有効化してください。
            </p>
            <div className="pt-4">
              <Link href="/auth/login" className="inline-block py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                ログインページに戻る
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            メールが届かない場合は、迷惑メールフォルダを確認するか、
            <a href="mailto:support@studyspark.jp" className="text-blue-500 hover:text-blue-600">
              サポート
            </a>
            にお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  );
} 