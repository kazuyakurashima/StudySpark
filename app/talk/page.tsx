"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { CoachSelection } from "@/components/talk/coach-selection"

export default function TalkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // コーチが選択済みかチェック
    const selectedCoach = localStorage.getItem("selectedCoach")
    if (selectedCoach) {
      router.push("/talk/room")
    } else {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center pb-20">
        <p>読み込み中...</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col pb-20">
      <Header title="トークルーム" />
      <CoachSelection />
      <BottomNavigation />
    </main>
  )
}
