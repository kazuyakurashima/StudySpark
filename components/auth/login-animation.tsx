"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export function LoginAnimation() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3) // 3秒のアニメーション
  const [showParticles, setShowParticles] = useState(false)
  const [redirectPath, setRedirectPath] = useState<string | null>(null)

  // リダイレクト処理を別のuseEffectで行う
  useEffect(() => {
    if (redirectPath) {
      console.log(`🚀 リダイレクト実行: ${redirectPath}`)
      router.push(redirectPath)
    }
  }, [redirectPath, router])

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    let particleTimer: NodeJS.Timeout | null = null

    // 0.5秒後にパーティクルを表示
    particleTimer = setTimeout(() => {
      setShowParticles(true)
    }, 500)

    const checkUserAndRedirect = async () => {
      try {
        console.log("🔍 ユーザー情報チェック開始")
        const { data } = await supabase.auth.getUser()
        
        if (!data.user) {
          console.log("⚠️ ユーザーセッションが見つかりません。ログイン画面へ。")
          setRedirectPath('/auth/login')
          return
        }

        console.log(`✅ ユーザーID: ${data.user.id}`)

        // usersテーブルからユーザーデータを取得
        console.log("⏳ usersテーブルからデータを取得中...")
        const { data: userData, error } = await supabase
          .from('users')
          .select('avatar_key, display_name, onboarding_completed')
          .eq('id', data.user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116: row not found は許容
          console.error("❌ usersテーブルからのデータ取得エラー:", error)
          // データ取得失敗時はフォールバックとしてオンボーディングに飛ばすか検討
          // ここでは一旦ログインに戻すが、本来はエラーページなどが望ましい
          setRedirectPath('/auth/login') 
          return
        }

        console.log("📊 取得したユーザーデータ:", userData)

        // カウントダウンを開始
        timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if(timer) clearInterval(timer)
              
              // --- リダイレクト判定 --- 
              console.log("⏳ リダイレクト先を判定中...")
              console.log(`   オンボーディング完了フラグ: ${userData?.onboarding_completed}`)
              console.log(`   アバターキー: ${userData?.avatar_key}`)
              console.log(`   表示名: ${userData?.display_name}`)

              let finalRedirectPath = '/auth/login' // デフォルトはログイン画面

              if (!userData) { 
                console.log("   判定: ユーザーデータなし -> /onboarding/avatar へ")
                finalRedirectPath = '/onboarding/avatar' // 具体的なパスに変更
              } else if (userData.onboarding_completed) {
                console.log("   判定: オンボーディング完了済み -> /home へ")
                finalRedirectPath = '/home'
              } else if (!userData.avatar_key) {
                console.log("   判定: アバター未設定 -> /onboarding/avatar へ")
                finalRedirectPath = '/onboarding/avatar' // 具体的なパスに変更
              } else if (!userData.display_name || userData.display_name === '名前未設定') {
                console.log("   判定: 名前未設定 -> /onboarding/name へ")
                finalRedirectPath = '/onboarding/name'
              } else {
                // DB上は完了しているが、何らかの理由でフラグがfalseの場合など
                console.log("   判定: 上記以外（フォールバック）-> /home へ")
                finalRedirectPath = '/home' 
              }
              
              console.log(`   ✅ 最終リダイレクト先: ${finalRedirectPath}`)
              setRedirectPath(finalRedirectPath)
              return 0
            }
            return prev - 1
          })
        }, 1000)

      } catch (error) {
        console.error("❌ 認証またはユーザーデータチェック中に予期せぬエラー:", error)
        setRedirectPath('/auth/login')
      }
    }

    checkUserAndRedirect()

    // クリーンアップ関数
    return () => {
      if(timer) clearInterval(timer)
      if(particleTimer) clearTimeout(particleTimer)
    }
  }, []) // countdownを依存配列から削除し、初回のみ実行

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white overflow-hidden relative">
      {/* パーティクルアニメーション */}
      {showParticles && (
        <div className="absolute inset-0 z-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                color: `hsl(${Math.random() * 60 + 200}, 100%, 70%)`,
                fontSize: `${Math.random() * 15 + 10}px`,
                textShadow: `0 0 ${Math.random() * 10 + 5}px hsl(${Math.random() * 60 + 200}, 100%, 80%)`,
              }}
            >
              ★
            </div>
          ))}
        </div>
      )}

      <div className="text-center z-10 relative">
        <div className="flex items-center justify-center mb-8">
          <div className="animate-bounce text-blue-500">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 2L14.09 8.26L20.5 8.27L15.21 12.14L17.29 18.4L12 14.53L6.71 18.4L8.79 12.14L3.5 8.27L9.91 8.26L12 2Z" 
                fill="currentColor" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-blue-600 mb-4 animate-pulse">StudySpark</h1>
        <p className="text-lg text-gray-600 mb-8">学習の旅に出かけましょう...</p>
        
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="absolute w-full text-center mt-4 text-blue-600 font-medium">
            {countdown}秒
          </p>
        </div>
      </div>
    </div>
  )
} 