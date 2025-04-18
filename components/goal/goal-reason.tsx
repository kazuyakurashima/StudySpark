"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { UserCircle2, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function GoalReason() {
  const [customReason, setCustomReason] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(true)
  const router = useRouter()

  // 紙吹雪アニメーションを表示するための状態
  useEffect(() => {
    // 3秒後に紙吹雪を非表示にする
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const reasons = [
    "自信をつけたいから",
    "志望校に合格するため",
    "親や先生に認められたいから",
    "ライバルに勝ちたいから",
    "部活や習い事と両立したいから",
    "なんとなく「ちゃんとしたい」と思ったから",
    "その他（自分で書く）",
  ]

  const handleReasonSelect = (reason: string) => {
    if (reason === "その他（自分で書く）") {
      setShowCustomInput(true)
      setSelectedReason(reason)
    } else {
      setSelectedReason(reason)

      // 選択した理由をローカルストレージに保存（実際のアプリではSupabaseに保存）
      localStorage.setItem("goalReason", reason)

      // 選択肢をクリックした場合は直接次の画面へ
      setTimeout(() => {
        router.push("/goal")
      }, 800)
    }
  }

  const handleCustomReasonSubmit = () => {
    // カスタム理由をローカルストレージに保存（実際のアプリではSupabaseに保存）
    localStorage.setItem("goalReason", customReason || "その他")

    // カスタム理由を送信して次の画面へ
    router.push("/goal")
  }

  return (
    <div className="p-4 relative">
      {/* 紙吹雪アニメーション */}
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start space-x-4">
            <div className="bg-gray-200 rounded-full p-2">
              <UserCircle2 className="h-10 w-10 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-lg">目標を設定してくれてありがとう！</CardTitle>
              <CardDescription>ちょっとだけ、どうしてこの目標にしたのか聞かせてくれると嬉しいな😊</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {reasons.map((reason) => (
              <Button
                key={reason}
                variant={selectedReason === reason ? "default" : "outline"}
                className={`w-full justify-start h-auto py-3 px-4 text-left hover-effect ${
                  selectedReason === reason ? "bg-blue-500 text-white btn-selected" : ""
                }`}
                onClick={() => handleReasonSelect(reason)}
              >
                {reason}
                {reason === "その他（自分で書く）" && (
                  <span className="ml-auto">
                    {showCustomInput ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                )}
              </Button>
            ))}
          </div>

          <AnimatePresence>
            {showCustomInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-2">
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
                    className="min-h-[120px]"
                  />

                  <Button className="w-full hover-effect" onClick={handleCustomReasonSubmit}>
                    登録する
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
