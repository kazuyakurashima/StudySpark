"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TaskEvaluationGuideProps {
  onClose?: () => void
}

export function TaskEvaluationGuide({ onClose }: TaskEvaluationGuideProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem("has_seen_evaluation_guide", "true")
    if (onClose) onClose()
  }

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("has_seen_evaluation_guide") === "true"
    if (hasSeenGuide) {
      setIsVisible(false)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
        <div className="bg-blue-500 text-white p-4">
          <h2 className="text-xl font-bold">評価方法について</h2>
        </div>

        <div className="p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="font-bold text-lg">完答</p>
                <p className="text-gray-600">問題が完全に解けた場合</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="font-bold text-lg">一部正解</p>
                <p className="text-gray-600">部分的に解けた場合</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Circle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-lg">誤答</p>
                <p className="text-gray-600">解けなかった場合</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-bold text-lg"
              onClick={handleClose}
            >
              閉じる
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
