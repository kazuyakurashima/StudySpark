"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, UserCircle2, X, Sparkles } from "lucide-react"
import { StudyPlanCoachChat } from "./study-plan-coach-chat"
import { AutoPlanDialog } from "./auto-plan-dialog"
import { PlanModificationOptions } from "./plan-modification-options"
import { motion } from "framer-motion"
import { generatePlannedTasks } from "@/data/math-problems"

interface StudyPlanCreatorProps {
  onPlanCreated: (plannedTasks: any[]) => void
  hasPlan?: boolean
  problemData: any[]
}

export function StudyPlanCreator({ onPlanCreated, hasPlan = false, problemData }: StudyPlanCreatorProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [showAutoPlanDialog, setShowAutoPlanDialog] = useState(false)
  const [planMode, setPlanMode] = useState<"auto" | "coach" | null>(null)
  const [maxReviewDays, setMaxReviewDays] = useState(14)
  const [showCoachUI, setShowCoachUI] = useState(false)
  const [showModificationOptions, setShowModificationOptions] = useState(false)

  // モックデータ：テスト開始日を取得
  useEffect(() => {
    // ローカルストレージからテスト開始日を取得（実際のアプリではSupabaseから取得）
    const savedStartDate = localStorage.getItem("startDate")
    if (savedStartDate) {
      const date = new Date(savedStartDate)

      // 最大学習日数を計算
      const today = new Date()
      const diffTime = date.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // 最大復習日数は学習日数の半分（最低1日）
      const maxReview = Math.max(1, Math.floor(diffDays / 2))
      setMaxReviewDays(maxReview)
    } else {
      // テスト日が設定されていない場合のフォールバック
      setMaxReviewDays(14)
    }
  }, [])

  // 初期表示時に自動的にダイアログを表示
  useEffect(() => {
    // 少し遅延させてダイアログを表示
    const timer = setTimeout(() => {
      setShowDialog(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleOpenDialog = () => {
    setShowDialog(true)
    setPlanMode(null)
    setShowCoachUI(false)
  }

  const handleOpenModificationOptions = () => {
    setShowModificationOptions(true)
    setPlanMode(null)
    setShowCoachUI(false)
  }

  const handleSelectMode = (mode: "auto" | "coach") => {
    setPlanMode(mode)
    setShowDialog(false)
    setShowModificationOptions(false)

    if (mode === "auto") {
      setShowAutoPlanDialog(true)
      setShowCoachUI(false)
    } else if (mode === "coach") {
      // コーチUIを表示する前に少し遅延を入れて、UIの更新を確実にします
      setTimeout(() => {
        setShowCoachUI(true)
        // コーチUIが表示された後、その要素までスクロールします
        setTimeout(() => {
          // コーチUIの要素を取得してスクロール
          const coachElement = document.querySelector(".coach-ui-container")
          if (coachElement) {
            coachElement.scrollIntoView({ behavior: "smooth", block: "start" })
          } else {
            // 要素が見つからない場合は、ページの先頭にスクロール
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
        }, 100)
      }, 50)
    }
  }

  const handleCreateAutoPlan = (settings: {
    levels: { basic: boolean; standard: boolean; advanced: boolean }
    reviewPeriod: number
    reviewDays: { [key: string]: boolean }
    problemRange?: { unsolved: boolean; incorrect: boolean; partial: boolean; complete: boolean }
  }) => {
    // 学習計画作成のモックアルゴリズム
    setTimeout(() => {
      // 学習計画の作成が完了したことをローカルストレージに記録
      localStorage.setItem("has_study_plan", "true")
      localStorage.setItem("study_levels", JSON.stringify(settings.levels))
      localStorage.setItem("review_period", settings.reviewPeriod.toString())
      localStorage.setItem("review_days", JSON.stringify(settings.reviewDays))

      // 問題範囲の設定がある場合は保存
      if (settings.problemRange) {
        localStorage.setItem("problem_range", JSON.stringify(settings.problemRange))
      }

      // 学習計画に基づいたタスクを生成
      const plannedTasks = generatePlannedTasks(problemData, settings)

      // 親コンポーネントに計画作成完了を通知
      onPlanCreated(plannedTasks)
    }, 1500)
  }

  return (
    <>
      {/* 学習計画作成ボタン */}
      <Card className="mb-4 shadow-sm border-0 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-blue-500" />
            {hasPlan ? "学習計画を修正する" : "学習計画を立てる"}
          </CardTitle>
          <CardDescription>
            {hasPlan ? "現在の学習計画を見直して修正できます" : "テスト範囲に合わせた学習計画を立てましょう"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {hasPlan ? (
            showModificationOptions ? (
              <PlanModificationOptions onSelectMode={handleSelectMode} />
            ) : (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start goal-button py-3 text-base hover-effect"
                  onClick={handleOpenModificationOptions}
                >
                  <Sparkles className="mr-2 h-5 w-5 text-blue-500" />
                  学習計画を修正する
                </Button>
              </motion.div>
            )
          ) : (
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="w-full goal-button py-4 text-base hover-effect" onClick={handleOpenDialog}>
                  <Calendar className="mr-2 h-5 w-5" />
                  学習計画を立てる
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <button
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                  onClick={() => setShowDialog(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">閉じる</span>
                </button>
                <DialogHeader>
                  <DialogTitle className="text-xl text-center">学習計画の立て方を選択</DialogTitle>
                  <DialogDescription className="text-center">どのように学習計画を立てますか？</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* 自動で計画を立てるカード */}
                  <div className="plan-option-card" onClick={() => handleSelectMode("auto")}>
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="mb-4 rounded-full bg-blue-50 p-3">
                        <Calendar className="h-8 w-8 text-[#00c6ff]" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">自動で計画を立てる</h3>
                      <p className="text-gray-500">学習設定を選んで自動作成します</p>
                    </div>
                  </div>

                  {/* コーチと一緒に計画を立てるカード */}
                  <div className="plan-option-card" onClick={() => handleSelectMode("coach")}>
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="mb-4 rounded-full bg-blue-50 p-3">
                        <UserCircle2 className="h-8 w-8 text-[#00c6ff]" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">コーチと一緒に計画を立てる</h3>
                      <p className="text-gray-500">対話形式で最適な計画を作成します</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>

      {/* 自動計画作成ダイアログ */}
      <AutoPlanDialog
        open={showAutoPlanDialog}
        onOpenChange={setShowAutoPlanDialog}
        onCreatePlan={handleCreateAutoPlan}
        hasPlan={hasPlan}
      />

      {/* コーチと一緒に計画を立てるUI - 選択時のみ表示 */}
      {showCoachUI && (
        <div className="coach-ui-container">
          <StudyPlanCoachChat
            onPlanCreated={(settings) => {
              const plannedTasks = generatePlannedTasks(problemData, settings)
              onPlanCreated(plannedTasks)
            }}
            hasPlan={hasPlan}
            maxReviewDays={maxReviewDays}
          />
        </div>
      )}
    </>
  )
}
