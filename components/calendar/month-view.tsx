"use client"

import { useState, useEffect, useCallback } from "react"
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns"
import { ja } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SparkTask } from "@/types/task"
import { useTaskContext } from "@/contexts/task-context"
import { useMobile } from "@/hooks/use-mobile"
import { toSafeDate, isSameDate } from "@/utils/date-utils"

interface MonthViewProps {
  currentDate: Date
  testDates: {
    start: Date
    end: Date
  }
  onDateChange?: (date: Date) => void
}

export function MonthView({ currentDate, testDates, onDateChange }: MonthViewProps) {
  const { tasks, updateTask } = useTaskContext()
  const [monthTasks, setMonthTasks] = useState<SparkTask[]>([])
  const [displayDate, setDisplayDate] = useState(currentDate)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const isMobile = useMobile()

  // 月の開始日と終了日
  const monthStart = startOfMonth(displayDate)
  const monthEnd = endOfMonth(displayDate)

  // 月の日付を配列で取得
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 今日の日付
  const today = new Date()

  // 月のタスクを取得
  useEffect(() => {
    const filteredTasks = tasks.filter((task) => {
      if (!task.dueDate) return false

      // dueDate を安全に Date オブジェクトに変換
      const dueDate = toSafeDate(task.dueDate)

      // 無効な日付の場合はスキップ
      if (!dueDate) return false

      return dueDate.getFullYear() === displayDate.getFullYear() && dueDate.getMonth() === displayDate.getMonth()
    })
    setMonthTasks(filteredTasks)
  }, [tasks, displayDate])

  // 前月へ
  const handlePrevMonth = () => {
    const newDate = subMonths(displayDate, 1)
    setDisplayDate(newDate)
  }

  // 翌月へ
  const handleNextMonth = () => {
    const newDate = addMonths(displayDate, 1)
    setDisplayDate(newDate)
  }

  // 今月へ
  const handleCurrentMonth = () => {
    setDisplayDate(new Date())
  }

  // 日付をクリックしたときの処理
  const handleDateClick = (date: Date) => {
    if (onDateChange) {
      onDateChange(date)
    }
  }

  // マウスオーバー時の処理
  const handleMouseEnter = (date: Date) => {
    setHoveredDate(date)
  }

  // マウスアウト時の処理
  const handleMouseLeave = () => {
    setHoveredDate(null)
  }

  // 日付ごとのタスク数を取得
  const getTaskCountForDate = (date: Date) => {
    return monthTasks.filter((task) => {
      if (!task.dueDate) return false

      // dueDate を安全に Date オブジェクトに変換
      const dueDate = toSafeDate(task.dueDate)

      // 無効な日付の場合はスキップ
      if (!dueDate) return false

      return isSameDate(dueDate, date)
    }).length
  }

  // 日付ごとの完了タスク数を取得
  const getCompletedTaskCountForDate = (date: Date) => {
    return monthTasks.filter((task) => {
      if (!task.dueDate) return false

      // dueDate を安全に Date オブジェクトに変換
      const dueDate = toSafeDate(task.dueDate)

      // 無効な日付の場合はスキップ
      if (!dueDate) return false

      return isSameDate(dueDate, date) && task.status === "complete"
    }).length
  }

  // テスト日かどうかをチェック
  const isTestDay = (date: Date) => {
    return (
      (testDates.start &&
        date.getFullYear() === testDates.start.getFullYear() &&
        date.getMonth() === testDates.start.getMonth() &&
        date.getDate() === testDates.start.getDate()) ||
      (testDates.end &&
        date.getFullYear() === testDates.end.getFullYear() &&
        date.getMonth() === testDates.end.getMonth() &&
        date.getDate() === testDates.end.getDate())
    )
  }

  // 曜日に応じた背景スタイルを取得
  const getDayBackgroundStyle = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return "bg-gray-50"

    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0) {
      // 日曜日
      return "bg-gradient-to-br from-red-50 to-white"
    } else if (dayOfWeek === 6) {
      // 土曜日
      return "bg-gradient-to-br from-blue-50 to-white"
    }
    return "bg-white"
  }

  // 曜日に応じたテキストカラーを取得
  const getDayTextColor = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return "text-gray-400"

    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0) {
      // 日曜日
      return "text-red-500"
    } else if (dayOfWeek === 6) {
      // 土曜日
      return "text-blue-500"
    }
    return isCurrentMonth ? "text-gray-700" : "text-gray-400"
  }

  // カレンダーの行を生成（月曜始まり）
  const generateCalendarRows = () => {
    // 月の最初の日の前の月曜日を取得
    const firstDayOfCalendar = startOfWeek(monthStart, { weekStartsOn: 1 }) // 1は月曜日

    // 月の最後の日の次の日曜日を取得
    const lastDayOfCalendar = endOfWeek(monthEnd, { weekStartsOn: 1 })

    // カレンダーに表示する全ての日を取得
    const calendarDays = eachDayOfInterval({ start: firstDayOfCalendar, end: lastDayOfCalendar })

    // 行ごとに分割（7日ごと）
    const rows = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      rows.push(calendarDays.slice(i, i + 7))
    }

    return rows
  }

  const calendarRows = generateCalendarRows()

  // レスポンシブ対応のためのスタイル調整
  const cellHeight = isMobile ? "h-12" : "h-20"
  const fontSize = isMobile ? "text-xs" : "text-sm"
  const dayNumberSize = isMobile ? "text-sm" : "text-base"

  // タスクのステータスを変更する関数を追加
  const handleTaskStatusChange = useCallback(
    (taskId: string, status: "complete" | "partial" | "incorrect" | null) => {
      // 現在のタスクを取得
      const task = monthTasks.find((t) => t.id === taskId)
      if (!task) {
        console.error(`Task with id ${taskId} not found`)
        return
      }

      // 同じステータスをクリックした場合はnullに戻す
      const newStatus = task.status === status ? null : status

      // 即座にUIを更新
      const updatedTask = { ...task, status: newStatus }
      setMonthTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))

      // バックエンドの更新処理
      updateTask(taskId, { status: newStatus })

      // スパークリストのデータも更新
      if (taskId.startsWith("spark-")) {
        // スパークデータ更新処理
        const parts = taskId.split("-")
        if (parts.length >= 3) {
          const chapterId = Number.parseInt(parts[1])
          const problemId = Number.parseInt(parts[2])

          if (!isNaN(chapterId) && !isNaN(problemId)) {
            const sparkTaskData = localStorage.getItem("spark_task_data")
            if (sparkTaskData) {
              try {
                const parsedData = JSON.parse(sparkTaskData)
                let updated = false

                // スパークデータを更新
                if (Array.isArray(parsedData)) {
                  const updatedData = parsedData.map((chapter) => {
                    if (chapter.id === chapterId && Array.isArray(chapter.problems)) {
                      const updatedProblems = chapter.problems.map((problem) => {
                        if (problem.id === problemId) {
                          updated = true
                          return {
                            ...problem,
                            status: newStatus,
                            lastUpdated: newStatus ? new Date().toISOString() : null,
                          }
                        }
                        return problem
                      })

                      return { ...chapter, problems: updatedProblems }
                    }
                    return chapter
                  })

                  if (updated) {
                    localStorage.setItem("spark_task_data", JSON.stringify(updatedData))
                    window.dispatchEvent(new CustomEvent("spark-tasks-updated"))
                  }
                }
              } catch (error) {
                console.error("Failed to update spark task data:", error)
              }
            }
          }
        }
      }
    },
    [monthTasks, updateTask],
  )

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">{format(displayDate, "yyyy年M月", { locale: ja })}</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleCurrentMonth}>
            今月
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {["月", "火", "水", "木", "金", "土", "日"].map((day, i) => (
          <div
            key={i}
            className={cn(
              "text-center py-1 font-medium",
              i === 5 ? "text-blue-500" : i === 6 ? "text-red-500" : "text-gray-700",
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarRows.flat().map((day, i) => {
          const isCurrentMonth = isSameMonth(day, displayDate)
          const isToday = isSameDay(day, today)
          const taskCount = getTaskCountForDate(day)
          const completedTaskCount = getCompletedTaskCountForDate(day)
          const hasTask = taskCount > 0
          const allTasksCompleted = hasTask && taskCount === completedTaskCount
          const someTasksCompleted = hasTask && completedTaskCount > 0 && completedTaskCount < taskCount
          const isTest = isTestDay(day)
          const isHovered = hoveredDate && isSameDay(day, hoveredDate)
          const dayBackground = getDayBackgroundStyle(day, isCurrentMonth)
          const dayTextColor = getDayTextColor(day, isCurrentMonth)

          return (
            <div
              key={i}
              className={cn(
                `${cellHeight} border rounded-md p-1 cursor-pointer transition-all duration-200`,
                dayBackground,
                isToday ? "border-blue-500 border-2" : isHovered ? "border-blue-400 border-2" : "border-gray-200",
                isTest ? "bg-red-50 border-red-200" : "",
                hasTask ? "hover:border-blue-300" : "hover:border-gray-300",
                isHovered && "shadow-lg transform scale-105 z-10",
              )}
              onClick={() => handleDateClick(day)}
              onMouseEnter={() => handleMouseEnter(day)}
              onMouseLeave={handleMouseLeave}
              onTouchStart={() => handleMouseEnter(day)}
              onTouchEnd={(e) => {
                e.preventDefault() // タッチイベントのデフォルト動作を防止
                handleDateClick(day)
                setTimeout(() => handleMouseLeave(), 300) // タッチ後にハイライトを少し残す
              }}
            >
              <div className={cn("flex flex-col h-full", isHovered && "bg-blue-50 rounded-md p-1")}>
                <div
                  className={cn(
                    `${dayNumberSize} font-medium`,
                    dayTextColor,
                    isTest ? "text-red-600" : "",
                    isHovered && "text-blue-700",
                  )}
                >
                  {format(day, "d")}
                </div>
                {isTest && !isMobile && <div className="text-xs text-red-600 mt-1">テスト</div>}
                {hasTask && (
                  <div className={`mt-auto ${fontSize} flex items-center`}>
                    <div
                      className={cn(
                        "w-full h-1.5 rounded-full overflow-hidden bg-gray-200",
                        isMobile ? "mt-1" : "mt-2",
                      )}
                    >
                      <div
                        className={cn(
                          "h-full rounded-full",
                          allTasksCompleted
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : someTasksCompleted
                              ? "bg-gradient-to-r from-amber-400 to-amber-600"
                              : "bg-gradient-to-r from-blue-400 to-blue-600",
                        )}
                        style={{
                          width: hasTask ? `${(completedTaskCount / taskCount) * 100}%` : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                )}
                {(!isMobile || isHovered) && hasTask && (
                  <div className="text-xs text-gray-500 mt-1">
                    {completedTaskCount}/{taskCount}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
