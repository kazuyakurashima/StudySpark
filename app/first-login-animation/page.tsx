"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function FirstLoginAnimationPage() {
  const router = useRouter()

  useEffect(() => {
    // アニメーション表示後、5秒後にアバター選択画面に自動遷移
    const timer = setTimeout(() => {
      router.push("/onboarding")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-gradient-fade"
        style={{ backgroundSize: "200% 200%" }}
      ></div>
      <div className="relative z-10 text-white text-2xl font-bold text-center px-4 animate-float-text">
        {/* PCでは1行表示、スマホでは2行表示 */}
        <div className="hidden md:block">あなたの可能性を開く冒険　今始まる</div>
        <div className="md:hidden">
          <div className="mb-2">あなたの可能性を開く冒険</div>
          <div>今始まる</div>
        </div>
      </div>
    </div>
  )
}
