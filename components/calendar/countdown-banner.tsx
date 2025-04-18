"use client"

import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CountdownBannerProps {
  daysUntilTest: number
}

export function CountdownBanner({ daysUntilTest }: CountdownBannerProps) {
  // 残り日数に応じて色を変える
  const getColorClass = () => {
    if (daysUntilTest <= 1) return "bg-red-500 text-white countdown-banner-critical"
    if (daysUntilTest <= 3) return "bg-orange-500 text-white"
    return "bg-amber-500 text-white"
  }

  // 残り日数に応じてメッセージを変える
  const getMessage = () => {
    if (daysUntilTest <= 1) return "明日がテストです！最終確認を忘れずに。"
    if (daysUntilTest <= 3) return "テスト直前です。復習を集中的に行いましょう。"
    return "テスト週間が近づいています。計画的に学習を進めましょう。"
  }

  return (
    <div
      className={cn(
        "py-2 px-4 flex items-center justify-center text-center transition-all duration-500",
        getColorClass(),
      )}
    >
      <AlertTriangle className="h-4 w-4 mr-2 animate-pulse" />
      <span className="font-medium">テストまであと{daysUntilTest}日</span>
      <span className="hidden md:inline ml-2">- {getMessage()}</span>
    </div>
  )
}
