"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"

// コーチのデータを拡充
const coaches = [
  {
    id: 1,
    type: "male",
    name: "タケル",
    specialty: "数学・物理",
    description: "論理的思考を重視し、着実なステップで目標達成をサポートします。",
    src: "/math-coach-avatar.png",
  },
  {
    id: 2,
    type: "male",
    name: "ヒロト",
    specialty: "英語・国語",
    description: "ポジティブな声かけが得意。モチベーションを保ちながら一緒に頑張りましょう。",
    src: "/friendly-language-coach.png",
  },
  {
    id: 3,
    type: "female",
    name: "アヤカ",
    specialty: "数学・化学",
    description: "細かい部分まで丁寧に解説。苦手分野の克服を徹底サポートします。",
    src: "/empowered-science-mentor.png",
  },
  {
    id: 4,
    type: "female",
    name: "ミカ",
    specialty: "英語・社会",
    description: "親しみやすい対話で、学習の悩みを一緒に解決していきます。",
    src: "/friendly-english-coach.png",
  },
  {
    id: 5,
    type: "neutral",
    name: "ユウ",
    specialty: "全科目バランス型",
    description: "バランス良く学習計画を立て、効率的な学習方法を提案します。",
    src: "/balanced-coach.png",
  },
  {
    id: 6,
    type: "neutral",
    name: "カイ",
    specialty: "メンタル重視",
    description: "学習の継続をメンタル面から支え、長期的な成長をサポートします。",
    src: "/placeholder.svg?height=100&width=100&query=neutral mental coach avatar",
  },
]

export function CoachSelection() {
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null)
  const [showAnimation, setShowAnimation] = useState(true)
  const [animationComplete, setAnimationComplete] = useState(false)
  const router = useRouter()

  // 初回アニメーション用のタイマー
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false)
      setAnimationComplete(true)
    }, 5000) // 5秒後にアニメーション終了

    return () => clearTimeout(timer)
  }, [])

  const handleContinue = () => {
    if (selectedCoach !== null) {
      // 実際の実装ではSupabaseに保存します
      localStorage.setItem("selectedCoach", JSON.stringify(coaches[selectedCoach - 1]))
      router.push("/talk/room")
    }
  }

  if (showAnimation) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-4">あなたの学習をサポートします</h2>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <p className="text-lg mb-6">最適なコーチがあなたの可能性を引き出します</p>
          </motion.div>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="flex justify-center"
          >
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=100&width=100&query=sparkle animation"
                alt="Sparkle"
                width={80}
                height={80}
                className="animate-pulse"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">あなたの味方</CardTitle>
          <CardDescription className="text-center">コーチを選んで学習の旅を始めましょう！</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {coaches.map((coach) => (
              <motion.div
                key={coach.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (coach.id - 1) * 0.1 }}
                className={`coach-card p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedCoach === coach.id
                    ? "border-2 border-blue-500 bg-blue-50"
                    : "border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                }`}
                onClick={() => setSelectedCoach(coach.id)}
              >
                <div className="flex flex-col items-center">
                  <div className="avatar-container relative mb-2">
                    <div className="w-20 h-20 rounded-full overflow-hidden">
                      <Image
                        src={coach.src || "/placeholder.svg"}
                        alt={`Coach ${coach.name}`}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {selectedCoach === coach.id && (
                      <div className="absolute -right-1 -bottom-1 bg-blue-500 text-white rounded-full p-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-center">{coach.name}</h3>
                  <p className="text-xs text-gray-500 text-center">{coach.specialty}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {selectedCoach !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-4 bg-blue-50 rounded-lg"
            >
              <h3 className="font-medium mb-1">{coaches[selectedCoach - 1].name}</h3>
              <p className="text-sm text-gray-700">{coaches[selectedCoach - 1].description}</p>
            </motion.div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleContinue} disabled={selectedCoach === null}>
            このコーチと始める
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
