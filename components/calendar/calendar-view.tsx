"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  format,
  addMonths,
  subMonths,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  isSameDay,
} from "date-fns"
import { ja } from "date-fns/locale"
import { AlertTriangle, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CountdownBanner } from "./countdown-banner"
import { useTaskContext } from "@/contexts/task-context"
import { useSwipeable } from "react-swipeable"
import { TaskViewSwitcher } from "./task-view-switcher"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMobile } from "@/hooks/use-mobile"
import { motion, AnimatePresence } from "framer-motion"
import { toSafeDate, isSameDate } from "@/utils/date-utils"
// 以下の行を削除または修正します
// import { generateTaskSchedule } from "@/lib/utils"

export type ViewMode = "day" | "week" | "month"

interface CalendarViewProps {
  initialMode?: ViewMode
}

export function CalendarView({ initialMode = "day" }: CalendarViewProps) {
  // 代わりに、useTaskContextから取得するように修正します
  // 既存のuseTaskContextのインポート部分を以下のように変更します
  const { tasks, updateTask, generateTaskSchedule } = useTaskContext()
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showPostponeDialog, setShowPostponeDialog] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const autoScheduleCheckedRef = useRef(false)
  const [autoSchedule, setAutoSchedule] = useState(false)
  const isMobile = useMobile()
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [testDates, setTestDates] = useState({
    start: new Date(2025, 4, 20), // 5月20日
    end: new Date(2025, 4, 21), // 5月21日
  })
  const [daysUntilTest, setDaysUntilTest] = useState(0)
  const [isTestSoon, setIsTestSoon] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // テスト日程を取得
  useEffect(() => {
    try {
      // ローカルストレージからテスト日を取得
      const savedStartDate = localStorage.getItem("startDate")
      const savedEndDate = localStorage.getItem("endDate")

      let start = new Date(2025, 4, 20) // デフォルト: 5月20日
      let end = new Date(2025, 4, 21) // デフォルト: 5月21日

      if (savedStartDate) {
        const parsedStart = toSafeDate(savedStartDate)
        if (parsedStart) start = parsedStart
      }

      if (savedEndDate) {
        const parsedEnd = toSafeDate(savedEndDate)
        if (parsedEnd) end = parsedEnd
      }

      setTestDates({ start, end })

      // カウントダウン日数の計算
      const today = new Date()
      const days = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      setDaysUntilTest(Math.max(0, days))
      setIsTestSoon(days <= 7 && days > 0)
    } catch (error) {
      console.error("Error loading test dates:", error)
    }
  }, [])

  // URLパラメータからautoSchedule=trueを検出する処理
  useEffect(() => {
    if (autoScheduleCheckedRef.current || !isInitialized) return

    try {
      const urlParams = new URLSearchParams(window.location.search)
      const autoScheduleParam = urlParams.get("autoSchedule")

      if (autoScheduleParam === "true") {
        setAutoSchedule(true)

        const today = new Date()
        const twoWeeksLater = new Date()
        twoWeeksLater.setDate(today.getDate() + 14)

        setStartDate(today)
        setEndDate(twoWeeksLater)

        autoScheduleCheckedRef.current = true
      }
    } catch (error) {
      console.error("Error checking autoSchedule parameter:", error)
    }
  }, [isInitialized])

  // 保存された状態を復元するためのuseEffect
  useEffect(() => {
    try {
      // 保存されたビューモードを復元
      const savedViewMode = localStorage.getItem("restore_view_mode")
      if (savedViewMode && (savedViewMode === "day" || savedViewMode === "week" || savedViewMode === "month")) {
        setViewMode(savedViewMode as ViewMode)
        // 使用後に削除
        localStorage.removeItem("restore_view_mode")
      }

      // 保存された日付を復元
      const savedDateStr = localStorage.getItem("restore_current_date")
      if (savedDateStr) {
        try {
          const savedDate = new Date(savedDateStr)
          if (!isNaN(savedDate.getTime())) {
            setCurrentDate(savedDate)
          }
        } catch (e) {
          console.error("Invalid date format in localStorage", e)
        }
        // 使用後に削除
        localStorage.removeItem("restore_current_date")
      }

      setIsInitialized(true)
    } catch (error) {
      console.error("Error restoring saved state:", error)
      setIsInitialized(true)
    }
  }, [])

  // 現在の状態を保存するためのuseEffect
  useEffect(() => {
    if (!isInitialized) return

    try {
      // 現在のビューモードを保存
      localStorage.setItem("countdown_view_mode", viewMode)

      // 現在の日付を保存
      localStorage.setItem("countdown_current_date", currentDate.toISOString())
    } catch (error) {
      console.error("Error saving current state:", error)
    }
  }, [viewMode, currentDate, isInitialized])

  // アニメーション付きで前の期間へ移動
  const goToPrevious = useCallback(() => {
    if (isAnimating) return

    setSwipeDirection("right")
    setIsAnimating(true)

    setTimeout(() => {
      if (viewMode === "day") {
        setCurrentDate((prevDate) => subDays(prevDate, 1))
      } else if (viewMode === "week") {
        setCurrentDate((prevDate) => subWeeks(prevDate, 1))
      } else {
        setCurrentDate((prevDate) => subMonths(prevDate, 1))
      }

      setTimeout(() => {
        setSwipeDirection(null)
        setIsAnimating(false)
      }, 50)
    }, 200)
  }, [isAnimating, viewMode])

  // アニメーション付きで次の期間へ移動
  const goToNext = useCallback(() => {
    if (isAnimating) return

    setSwipeDirection("left")
    setIsAnimating(true)

    setTimeout(() => {
      if (viewMode === "day") {
        setCurrentDate((prevDate) => addDays(prevDate, 1))
      } else if (viewMode === "week") {
        setCurrentDate((prevDate) => addWeeks(prevDate, 1))
      } else {
        setCurrentDate((prevDate) => addMonths(prevDate, 1))
      }

      setTimeout(() => {
        setSwipeDirection(null)
        setIsAnimating(false)
      }, 50)
    }, 200)
  }, [isAnimating, viewMode])

  // 今日に戻る
  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  // 日付フォーマット - 表示モードに応じて変更
  const formatDateHeader = useCallback(
    (date: Date) => {
      if (viewMode === "day") {
        return format(date, "yyyy年M月d日(E)", { locale: ja })
      } else if (viewMode === "week") {
        const weekStart = startOfWeek(date, { weekStartsOn: 0 })
        const weekEnd = endOfWeek(date, { weekStartsOn: 0 })
        return `${format(weekStart, "yyyy年M月d日", { locale: ja })} - ${format(weekEnd, "M月d日", { locale: ja })}`
      }
      return format(date, "yyyy年M月", { locale: ja })
    },
    [viewMode],
  )

  // 未完了タスクのアラート表示（23時になったらアラート表示）
  useEffect(() => {
    if (!isInitialized) return

    const checkIncompleteTasks = () => {
      try {
        const currentHour = new Date().getHours()
        if (currentHour >= 23 && isSameDay(currentDate, new Date())) {
          const todayTasks = tasks.filter((task) => {
            if (!task.dueDate) return false

            // dueDate を安全に Date オブジェクトに変換
            const dueDate = toSafeDate(task.dueDate)
            if (!dueDate) return false

            return isSameDate(dueDate, new Date())
          })
          const hasIncompleteTasks = todayTasks.some((task) => task.status !== "complete")
          if (hasIncompleteTasks) {
            setShowPostponeDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking incomplete tasks:", error)
      }
    }

    // 初回チェック
    checkIncompleteTasks()

    // 1分ごとにチェック
    const interval = setInterval(checkIncompleteTasks, 60000)

    return () => clearInterval(interval)
  }, [currentDate, tasks, isInitialized])

  // 未完了タスクを翌日に繰り越す
  const handlePostponeTasks = useCallback(() => {
    try {
      const todayTasks = tasks.filter((task) => {
        if (!task.dueDate) return false

        // dueDate を安全に Date オブジェクトに変換
        const dueDate = toSafeDate(task.dueDate)
        if (!dueDate) return false

        return isSameDate(dueDate, new Date()) && task.status !== "complete"
      })

      // 各タスクを翌日に繰り越す
      todayTasks.forEach((task) => {
        if (task.dueDate) {
          const dueDate = toSafeDate(task.dueDate)
          if (dueDate) {
            const nextDay = addDays(dueDate, 1)
            updateTask(task.id, {
              dueDate: nextDay,
              originalDate: task.originalDate || task.dueDate,
            })
          }
        }
      })

      setShowPostponeDialog(false)
    } catch (error) {
      console.error("Error postponing tasks:", error)
    }
  }, [tasks, updateTask])

  // スパークタスクを自動割り振り
  const handleGenerateTasks = () => {
    if (startDate && endDate) {
      generateTaskSchedule(startDate, endDate)
      setShowGenerateDialog(false)
    }
  }

  // スワイプハンドラーを設定
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNext(),
    onSwipedRight: () => goToPrevious(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
    delta: 50,
  })

  // 現在の日付が今日かどうかをチェック
  const isCurrentDateToday = isSameDay(currentDate, new Date())

  // スワイプアニメーションのバリアント
  const variants = {
    enter: (direction: "left" | "right") => {
      return {
        x: direction === "right" ? -300 : 300,
        opacity: 0,
      }
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "left" | "right") => {
      return {
        x: direction === "right" ? 300 : -300,
        opacity: 0,
      }
    },
  }

  if (!isInitialized) {
    return (
      <div className="flex flex-col h-full bg-gray-50 p-4">
        <div className="flex justify-center items-center h-[50vh]">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="ml-2">カレンダーを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* カウントダウンバナー */}
      {isTestSoon && <CountdownBanner daysUntilTest={daysUntilTest} />}

      {/* 新しいカレンダーヘッダーデザイン */}
      <div className="p-4 bg-white border-b sticky top-0 z-10 shadow-sm">
        {/* モード切替タブ - 視認性向上 */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-4">
          <button
            className={cn(
              "flex-1 text-sm py-2 rounded-md transition-all font-medium",
              viewMode === "day"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600 hover:bg-gray-200 hover:text-gray-800",
            )}
            onClick={() => setViewMode("day")}
          >
            日
          </button>
          <button
            className={cn(
              "flex-1 text-sm py-2 rounded-md transition-all font-medium",
              viewMode === "week"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600 hover:bg-gray-200 hover:text-gray-800",
            )}
            onClick={() => setViewMode("week")}
          >
            週
          </button>
          <button
            className={cn(
              "flex-1 text-sm py-2 rounded-md transition-all font-medium",
              viewMode === "month"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600 hover:bg-gray-200 hover:text-gray-800",
            )}
            onClick={() => setViewMode("month")}
          >
            月
          </button>
        </div>

        {/* 日付ナビゲーション - 改善版 */}
        <div className="flex items-center justify-between">
          {/* 「今日」ボタン - 目立つデザイン */}
          <Button
            variant={isCurrentDateToday ? "default" : "outline"}
            size="default"
            onClick={goToToday}
            className={cn(
              "flex items-center gap-1 transition-all px-4 py-2 h-auto",
              isCurrentDateToday
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-blue-600 hover:bg-blue-50 border-blue-200",
            )}
          >
            <Calendar className="h-4 w-4 mr-1" />
            今日
          </Button>

          {/* 日付表示と移動ボタン - 大きなタップエリア */}
          <div className="flex items-center justify-center gap-1 flex-1">
            {/* 前へボタン - 大きなタップエリア */}
            <button
              onClick={goToPrevious}
              className="flex items-center justify-center h-12 w-12 rounded-full hover:bg-blue-50 active:bg-blue-100 transition-colors"
              aria-label="前へ"
              disabled={isAnimating}
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>

            <div className="text-center font-medium text-gray-800 min-w-[140px] px-2">
              {formatDateHeader(currentDate)}
            </div>

            {/* 次へボタン - 大きなタップエリア */}
            <button
              onClick={goToNext}
              className="flex items-center justify-center h-12 w-12 rounded-full hover:bg-blue-50 active:bg-blue-100 transition-colors"
              aria-label="次へ"
              disabled={isAnimating}
            >
              <ChevronRight className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          {/* バランスを取るための空のスペース */}
          <div className="w-[88px]"></div>
        </div>
      </div>

      {/* カレンダー本体 - スワイプアニメーション追加 */}
      <div className="flex-1 overflow-hidden" {...swipeHandlers}>
        <AnimatePresence initial={false} custom={swipeDirection} mode="wait">
          <motion.div
            key={currentDate.toISOString() + viewMode}
            custom={swipeDirection}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 400, damping: 35 },
              opacity: { duration: 0.15 },
            }}
            className="h-full overflow-auto"
          >
            <TaskViewSwitcher currentDate={currentDate} testDates={testDates} viewMode={viewMode} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 未完了タスク繰り越しダイアログ */}
      <Dialog open={showPostponeDialog} onOpenChange={setShowPostponeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              未完了のタスクがあります
            </DialogTitle>
            <DialogDescription>本日のタスクで未完了のものがあります。明日に繰り越しますか？</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setShowPostponeDialog(false)}>
              後で確認する
            </Button>
            <Button onClick={handlePostponeTasks}>明日に繰り越す</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* カスタムCSS */}
      <style jsx global>{`
        /* ナビゲーションボタンのホバー効果を強調 */
        .nav-button:hover {
          transform: scale(1.05);
        }
        .nav-button:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  )
}
