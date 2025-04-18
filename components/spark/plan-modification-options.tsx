"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, UserCircle2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface PlanModificationOptionsProps {
  onSelectMode: (mode: "auto" | "coach") => void
}

export function PlanModificationOptions({ onSelectMode }: PlanModificationOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<"auto" | "coach" | null>(null)

  const handleOptionSelect = (option: "auto" | "coach") => {
    setSelectedOption(option)
    // 少し遅延を入れて選択アニメーションを見せる
    setTimeout(() => {
      onSelectMode(option)
    }, 300)
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          学習計画の修正方法
        </h2>
        <p className="text-gray-600 mt-2">シンプルさと効率性を追求した最適な学習計画修正</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Card
            className={`cursor-pointer h-full transition-all duration-200 ${
              selectedOption === "auto" ? "border-blue-500 bg-blue-50" : "hover:border-blue-300 hover:bg-blue-50/50"
            }`}
            onClick={() => handleOptionSelect("auto")}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">自動で修正する</h3>
                <p className="text-gray-600 text-sm">
                  AIが最適な学習計画を自動で修正します。シンプルな設定で素早く計画を見直せます。
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Card
            className={`cursor-pointer h-full transition-all duration-200 ${
              selectedOption === "coach" ? "border-blue-500 bg-blue-50" : "hover:border-blue-300 hover:bg-blue-50/50"
            }`}
            onClick={() => handleOptionSelect("coach")}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <UserCircle2 className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">コーチと一緒に修正する</h3>
                <p className="text-gray-600 text-sm">
                  対話形式でコーチと一緒に学習計画を修正します。より詳細なカスタマイズが可能です。
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="mt-6 text-center">
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-full"
          onClick={() => selectedOption && onSelectMode(selectedOption)}
          disabled={!selectedOption}
        >
          次へ進む
        </Button>
      </div>
    </div>
  )
}
