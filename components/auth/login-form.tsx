"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface LoginFormProps {
  isRegisterMode?: boolean;
}

export function LoginForm({ isRegisterMode = false }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isRegisterMode) {
        // パスワード確認チェック
        if (password !== confirmPassword) {
          throw new Error("パスワードが一致しません")
        }

        // 新規登録処理
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          throw error
        }

        // 登録成功後、確認メールを送信した旨を伝えるページにリダイレクト
        router.push('/auth/check-email')
      } else {
        // ログイン処理
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }

        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || (isRegisterMode ? '登録に失敗しました' : 'ログインに失敗しました'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    if (provider === 'apple') {
      alert('Apple IDでのログインは現在準備中です')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        if (error.message.includes("provider is not enabled")) {
          throw new Error("Googleログインが設定されていません。管理者に連絡してください。")
        }
        throw error
      }
    } catch (err: any) {
      setError(err.message || 'ソーシャルログインに失敗しました')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="text-center py-10">
        <div className="flex justify-center items-center mb-4">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3 text-blue-500">
            <path d="M12 2L14.09 8.26L20.5 8.27L15.21 12.14L17.29 18.4L12 14.53L6.71 18.4L8.79 12.14L3.5 8.27L9.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-5xl font-bold text-blue-500">StudySpark</h1>
        </div>
        <p className="text-gray-600 mt-2">定期テストに向けて効果的に学習しよう</p>
      </div>

      <div className="flex border-b relative">
        <Link 
          href="/auth/login"
          className={`flex-1 py-4 text-center font-medium text-lg transition-all duration-300 ${
            !isRegisterMode 
              ? 'text-blue-600 font-semibold relative z-10' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          ログイン
        </Link>
        <Link 
          href="/auth/register"
          className={`flex-1 py-4 text-center font-medium text-lg transition-all duration-300 ${
            isRegisterMode 
              ? 'text-blue-600 font-semibold relative z-10' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          新規登録
        </Link>
        <div className={`absolute bottom-0 h-1 bg-blue-500 transition-all duration-300 ease-in-out ${
          !isRegisterMode 
            ? 'left-0 w-1/2' 
            : 'left-1/2 w-1/2'
        }`} />
        <div className={`absolute inset-x-0 bottom-0 top-0 transition-all duration-300 ease-in-out ${
          !isRegisterMode 
            ? 'left-0 w-1/2 bg-blue-50' 
            : 'left-1/2 w-1/2 bg-blue-50'
        }`} />
      </div>

      <div className="p-8">
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-800 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 text-sm font-medium">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-lg bg-gray-50 border-gray-200 w-full text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 text-sm font-medium">パスワード</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-lg bg-gray-50 border-gray-200 w-full pr-10 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-14 w-14 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-r-lg transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
                <span className="sr-only">
                  {showPassword ? "パスワードを隠す" : "パスワードを表示"}
                </span>
              </Button>
            </div>
          </div>

          {isRegisterMode && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 text-sm font-medium">パスワード（確認）</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-14 rounded-lg bg-gray-50 border-gray-200 w-full pr-10 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 text-white rounded-lg font-medium text-base shadow-md hover:shadow-lg transform transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            disabled={isLoading}
          >
            {isLoading 
              ? (isRegisterMode ? "登録中..." : "ログイン中...") 
              : (isRegisterMode ? "アカウント登録" : "ログイン")}
          </Button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">または</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-12 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-500 focus:ring-2 focus:ring-gray-300 relative overflow-hidden group"
            onClick={() => handleSocialLogin('apple')}
            disabled={isLoading}
          >
            <div className="absolute inset-0 w-full h-full bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-200"></div>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
              <path d="M17.03 11.9999C17.0224 10.8218 17.536 9.83228 18.5743 9.0649C18.0269 8.29174 17.1531 7.83642 15.9755 7.69192C14.8635 7.55159 13.6297 8.24056 13.0456 8.24056C12.4253 8.24056 11.3299 7.719 10.4306 7.719C8.35212 7.7454 6.11377 9.47841 6.11377 13.0095C6.11377 14.028 6.30664 15.084 6.69239 16.1777C7.20453 17.6046 8.92625 20.6 10.7224 20.5457C11.5489 20.5186 12.1322 20.0094 13.1938 20.0094C14.2175 20.0094 14.7594 20.5457 15.6844 20.5457C17.5014 20.5167 19.0483 17.8002 19.5334 16.3692C17.0482 15.2526 17.0298 12.0612 17.0298 11.9999Z" fill="black"/>
              <path d="M14.6694 5.65925C15.398 4.79688 15.8944 3.64443 15.7678 2.5C14.7373 2.55702 13.5476 3.14649 12.7848 4.00886C12.0871 4.77968 11.5003 5.9483 11.6568 7.05531C12.7967 7.14093 13.9098 6.55563 14.6694 5.65925Z" fill="black"/>
            </svg>
            <span className="font-medium">Apple</span>
          </Button>
          <Button
            variant="outline"
            className="h-12 border border-gray-300 rounded-lg bg-white hover:bg-blue-50 active:bg-blue-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-400 focus:ring-2 focus:ring-blue-200 relative overflow-hidden group"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
          >
            <div className="absolute inset-0 w-full h-full bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-200"></div>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13999 18.63 6.70999 16.7 5.83999 14.1H2.17999V16.94C3.98999 20.53 7.69999 23 12 23Z" fill="#34A853"/>
              <path d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.07H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.93L5.84 14.09Z" fill="#FBBC05"/>
              <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.18 7.07L5.84 9.91C6.71 7.31 9.14 5.38 12 5.38Z" fill="#EA4335"/>
            </svg>
            <span className="font-medium">Google</span>
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          {isRegisterMode ? (
            <p>
              すでにアカウントをお持ちですか？{' '}
              <Link href="/auth/login" className="text-blue-500 hover:text-blue-700 font-medium hover:underline transition-colors">
                ログイン
              </Link>
            </p>
          ) : (
            <p>
              登録することで、
              <Link href="/terms" className="text-blue-500 hover:text-blue-700 font-medium hover:underline transition-colors">
                利用規約
              </Link>
              と
              <Link href="/privacy" className="text-blue-500 hover:text-blue-700 font-medium hover:underline transition-colors">
                プライバシーポリシー
              </Link>
              に同意したことになります。
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
