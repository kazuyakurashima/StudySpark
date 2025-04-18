"use client"

import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { Header } from "@/components/layout/header"
import { CalendarView } from "@/components/calendar/calendar-view"
import { useEffect, useState } from "react"
import { useTaskContext } from "@/contexts/task-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { GenerateMockData } from "@/components/calendar/mock-data"

export default function CountdownPage() {
  const { tasks, generateTaskSchedule } = useTaskContext()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialViewMode, setInitialViewMode] = useState<"day" | "week" | "month">("day")
  const [showMockDataGenerator, setShowMockDataGenerator] = useState(true)

  // スパークタスクの自動割り振りが行われているかをチェック
  useEffect(() => {
    const checkAndGenerateTasks = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 自動生成フラグをチェック
        const autoGenerateFlag = localStorage.getItem("auto_generate_calendar_tasks")

        if (autoGenerateFlag === "true") {
          console.log("Auto generating calendar tasks...")
          // フラグを削除（一度だけ実行するため）
          localStorage.removeItem("auto_generate_calendar_tasks")

          // テスト日を取得
          const savedStartDate = localStorage.getItem("startDate")
          let testDate = new Date()
          if (savedStartDate) {
            try {
              testDate = new Date(savedStartDate)
              if (isNaN(testDate.getTime())) {
                throw new Error("Invalid test date")
              }
            } catch (e) {
              console.error("Error parsing test date:", e)
              testDate = new Date()
              testDate.setMonth(testDate.getMonth() + 1) // デフォルトは1ヶ月後
            }
          } else {
            // デフォルトは1ヶ月後
            testDate.setMonth(testDate.getMonth() + 1)
          }

          // 今日の日付
          const today = new Date()

          // 自動的にタスクを生成（今日からテスト日まで）
          await generateTaskSchedule(today, testDate)

          toast({
            title: "カレンダータスクを生成しました",
            description: "スパークリストのタスクがカレンダーに反映されました",
            duration: 3000,
          })
        }

        // 前回の状態を復元
        const savedViewMode = localStorage.getItem("countdown_view_mode")
        const savedDateStr = localStorage.getItem("countdown_current_date")

        if (savedViewMode && (savedViewMode === "day" || savedViewMode === "week" || savedViewMode === "month")) {
          setInitialViewMode(savedViewMode as "day" | "week" | "month")
          // CalendarViewコンポーネントに渡すために保存
          localStorage.setItem("restore_view_mode", savedViewMode)
        }

        if (savedDateStr) {
          try {
            const savedDate = new Date(savedDateStr)
            if (!isNaN(savedDate.getTime())) {
              // CalendarViewコンポーネントに渡すために保存
              localStorage.setItem("restore_current_date", savedDateStr)
            }
          } catch (e) {
            console.error("Error parsing saved date:", e)
          }
        }
      } catch (err) {
        console.error("Error in checkAndGenerateTasks:", err)
        setError("タスクの生成中にエラーが発生しました。再読み込みしてください。")
      } finally {
        setIsLoading(false)
      }
    }

    checkAndGenerateTasks()
  }, [generateTaskSchedule])

  // エラー発生時の表示
  if (error) {
    return (
      <main className="flex min-h-screen flex-col">
        <Header title="カウントダウン" />
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200 max-w-md">
            <h3 className="font-medium mb-2">エラーが発生しました</h3>
            <p>{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              再読み込み
            </button>
          </div>
        </div>
        <BottomNavigation />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Header title="カウントダウン" />
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-12 w-full rounded-md" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-1/3 rounded-md" />
              <Skeleton className="h-10 w-1/3 rounded-md" />
              <Skeleton className="h-10 w-1/3 rounded-md" />
            </div>
            <Skeleton className="h-[60vh] w-full rounded-md" />
          </div>
        ) : (
          <>
            {showMockDataGenerator && (
              <div className="p-4">
                <GenerateMockData />
                <Button variant="outline" className="w-full mt-2" onClick={() => setShowMockDataGenerator(false)}>
                  モックデータ生成を非表示
                </Button>
              </div>
            )}
            <CalendarView initialMode={initialViewMode} />
          </>
        )}
      </div>
      <BottomNavigation />
    </main>
  )
}
