"use client"

import { useState, useEffect } from "react"
import { X, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OnboardingTourProps {
  onComplete: () => void
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showFinalMessage, setShowFinalMessage] = useState(false)
  const totalSteps = 4

  // ステップごとのコンテンツ
  const steps = [
    {
      id: 1,
      target: "goal-card",
      title: "ゴールナビ",
      content:
        "まずは**ゴールナビ**で、次のテストの目標を立てよう！目標順位とその理由を決めて、未来の自分に宣言する場所だよ。",
    },
    {
      id: 2,
      target: "countdown-card",
      title: "カウントダウン",
      content: "テストまであと何日？**カウントダウン**では、試験日までのスケジュールが見えるよ！",
    },
    {
      id: 3,
      target: "spark-card",
      title: "スパーク",
      content: "どの問題集をやるか決めよう！**スパーク**ではタスク管理をして、毎日の学習を可視化できるよ。",
    },
    {
      id: 4,
      target: "talk-card",
      title: "トークルーム",
      content: "今日どれくらい頑張った？**トークルーム**で毎日・毎週、ふり返りをしてみよう。",
    },
  ]

  // 次のステップへ
  const nextStep = () => {
    setShowFinalMessage(false)

    if (currentStep < totalSteps) {
      // 前のハイライトを削除
      removeAllHighlights()

      // 次のステップに進む
      setCurrentStep((prev) => prev + 1)
    } else {
      // 最終ステップの場合はツアー完了
      onComplete()
    }
  }

  // 前のステップへ
  const prevStep = () => {
    setShowFinalMessage(false)

    if (currentStep > 1) {
      // 前のハイライトを削除
      removeAllHighlights()

      // 前のステップに戻る
      setCurrentStep((prev) => prev - 1)
    }
  }

  // ツアーをスキップ
  const skipTour = () => {
    removeAllHighlights()
    onComplete()
  }

  // 現在のステップ情報
  const currentStepInfo = steps.find((step) => step.id === currentStep)

  // マークダウン風の**太字**をHTMLの<strong>に変換
  const formatContent = (content: string) => {
    return content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  }

  // すべてのハイライトを削除
  const removeAllHighlights = () => {
    document.querySelectorAll(".onboarding-highlight-target").forEach((el) => {
      el.classList.remove("onboarding-highlight-target")
    })
  }

  // 現在のステップの要素をハイライト
  const highlightCurrentStep = () => {
    if (!currentStepInfo) return

    // 前のハイライトを削除
    removeAllHighlights()

    // 現在のステップの要素を取得
    const targetElement = document.getElementById(currentStepInfo.target)

    if (targetElement) {
      // ハイライトクラスを追加
      targetElement.classList.add("onboarding-highlight-target")

      // 要素が画面内に収まるようにスクロール
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // ステップが変わったときの処理
  useEffect(() => {
    // 少し遅延させてDOM更新後に実行
    const timer = setTimeout(() => {
      highlightCurrentStep()
    }, 100)

    return () => clearTimeout(timer)
  }, [currentStep])

  // 最終ステップでの締めのメッセージ表示
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    // 最終ステップの場合
    if (currentStep === totalSteps) {
      // 2秒後に締めのメッセージを表示
      timer = setTimeout(() => {
        setShowFinalMessage(true)
      }, 2000)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [currentStep, totalSteps])

  // コンポーネントのアンマウント時の処理
  useEffect(() => {
    return () => {
      removeAllHighlights()
    }
  }, [])

  return (
    <div className="onboarding-container" style={{ pointerEvents: "none" }}>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={skipTour}
        style={{ pointerEvents: "auto" }}
      ></div>

      {/* 吹き出し */}
      {currentStepInfo && (
        <div
          className="fixed bottom-24 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50"
          style={{ pointerEvents: "auto" }}
        >
          {/* 吹き出しの上部 */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg text-[#00c6ff]">{currentStepInfo.title}</h3>
            <button onClick={skipTour} className="text-gray-400 hover:text-gray-600" style={{ pointerEvents: "auto" }}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 吹き出しの内容 */}
          <p
            className="text-gray-700 mb-4"
            dangerouslySetInnerHTML={{ __html: formatContent(currentStepInfo.content) }}
          ></p>

          {/* ナビゲーションボタン */}
          <div className="flex justify-between items-center">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="mr-2"
                  style={{ pointerEvents: "auto" }}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> 前へ
                </Button>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {currentStep} / {totalSteps}
            </div>
            <div>
              {currentStep < totalSteps ? (
                <Button size="sm" onClick={nextStep} style={{ pointerEvents: "auto" }}>
                  次へ <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={onComplete} style={{ pointerEvents: "auto" }}>
                  はじめる
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 締めのメッセージ */}
      {showFinalMessage && (
        <div
          className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       bg-white rounded-lg shadow-lg p-6 z-60 max-w-xs text-center"
        >
          <p className="text-lg font-medium mb-4">
            ⭐️StudySparkの使い方、わかったかな？
            <br />
            それでは、はじめるよ🔥
          </p>
        </div>
      )}
    </div>
  )
}
