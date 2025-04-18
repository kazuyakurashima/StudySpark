"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import TalkRoom from "@/components/talk/talk-room"

export default function TalkRoomPage() {
  const router = useRouter()
  const [coachName, setCoachName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // コーチが選択済みかチェック
    const selectedCoach = localStorage.getItem("selectedCoach")
    if (selectedCoach) {
      const coach = JSON.parse(selectedCoach)
      setCoachName(coach.name || "")
      setLoading(false)
    } else {
      // コーチが選択されていない場合は選択画面に戻る
      router.push("/talk")
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
      <Header title={`${coachName}コーチとのトーク`} />
      <TalkRoom />
      <BottomNavigation />
    </main>
  )
}
