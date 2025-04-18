"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { UserCircle2 } from "lucide-react"

export function GoalReasonEdit() {
  const [customReason, setCustomReason] = useState("")
  const [targetRank, setTargetRank] = useState<number>(10)
  const router = useRouter()

  // 既存のデータを読み込む
  useEffect(() => {
    const savedGoalReason = localStorage.getItem("goalReason")
    const savedTargetRank = localStorage.getItem("targetRank")

    if (savedGoalReason) {
      setCustomReason(savedGoalReason)
    }

    if (savedTargetRank) {
      setTargetRank(Number(savedTargetRank))
    }
  }, [])

  const handleSave = () => {
    // 入力内容をローカルストレージに保存（実際のアプリではSupabaseに保存）
    localStorage.setItem("goalReason", customReason)

    // 保存後にゴールナビ画面に戻る
    router.push("/goal")
  }

  return (
    <div className="p-4 relative">
      <Card>
        <CardHeader>
          <div className="flex items-start space-x-4">
            <div className="bg-gray-200 rounded-full p-2">
              <UserCircle2 className="h-10 w-10 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-lg">なぜ{targetRank}位を目指すのか？</CardTitle>
              <CardDescription>目標達成への思いを自由に書いてください</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 rounded-lg p-3 text-sm">
            <p className="font-semibold">✨ 書くときのヒント ✨</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>その順位を決めた理由は？</li>
              <li>それを達成したら、どんな自分になれそう？</li>
              <li>これからどんな気持ちで取り組む？</li>
            </ul>
          </div>

          <Textarea
            placeholder="これまであきらめてばかりだったけど、今回は本気で変わりたいと思って…"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            className="min-h-[150px]"
          />

          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1 hover-effect" onClick={() => router.push("/goal")}>
              キャンセル
            </Button>
            <Button className="flex-1 hover-effect" onClick={handleSave}>
              保存する
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
