"use client"

import { usePathname, useRouter } from "next/navigation"
import { Flag, Calendar, MessageCircle, Sparkles } from "lucide-react"

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="bottom-nav">
      <button className="nav-item" onClick={() => router.push("/goal")}>
        <Flag className={`nav-icon h-5 w-5 ${isActive("/goal") ? "text-[#00c6ff]" : "text-gray-500"}`} />
        <span className={isActive("/goal") ? "text-[#00c6ff]" : "text-gray-500"}>ゴールナビ</span>
      </button>
      <button className="nav-item" onClick={() => router.push("/countdown")}>
        <Calendar className={`nav-icon h-5 w-5 ${isActive("/countdown") ? "text-[#00c6ff]" : "text-gray-500"}`} />
        <span className={isActive("/countdown") ? "text-[#00c6ff]" : "text-gray-500"}>カウントダウン</span>
      </button>
      <button className="nav-item" onClick={() => router.push("/spark")}>
        <Sparkles className={`nav-icon h-5 w-5 ${isActive("/spark") ? "text-[#00c6ff]" : "text-gray-500"}`} />
        <span className={isActive("/spark") ? "text-[#00c6ff]" : "text-gray-500"}>スパーク</span>
      </button>
      <button className="nav-item" onClick={() => router.push("/talk")}>
        <MessageCircle className={`nav-icon h-5 w-5 ${isActive("/talk") ? "text-[#00c6ff]" : "text-gray-500"}`} />
        <span className={isActive("/talk") ? "text-[#00c6ff]" : "text-gray-500"}>トークルーム</span>
      </button>
    </div>
  )
}
