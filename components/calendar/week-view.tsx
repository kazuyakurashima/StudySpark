"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, addDays } from "date-fns"
import { ja } from "date-fns/locale"
import type { SparkTask } from "@/types/task"
import { useTaskContext } from "@/contexts/task-context"
import { useMobile } from "@/hooks/use-mobile"
import { toSafeDate, isSameDate } from "@/utils/date-utils"
import { TaskItem } from "./task-item"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface WeekViewProps {
  currentDate: Date
}

export function WeekView({ currentDate }: WeekViewProps) {
  const { tasks, updateTask } = useTaskContext()
  const [weekTasks, setWeekTasks] = useState<SparkTask[]>([])
  const [completionRate, setCompletionRate] = useState(0)
  const [bookTitles, setBookTitles] = useState<Record<string, string>>({})
  const isMobile = useMobile()
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showAnimation, setShowAnimation] = useState(true)
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  // 問題集の情報を取得
  useEffect(() => {
    // ローカルストレージから選択された問題集の情報を取得
    const selectedBookData = localStorage.getItem("selected_math_book")
    if (selectedBookData) {
      try {
        const bookData = JSON.parse(selectedBookData)
        if (bookData && bookData.title) {
          // 問題集のタイトルをセット
          setBookTitles({
            数学: bookData.title || "数学",
            // 他の科目がある場合はここに追加
          })
        }
      } catch (e) {
        console.error("Failed to parse selected book data", e)
      }
    } else {
      // 問題集データがない場合はデフォルト値を設定
      setBookTitles({
        数学: "数学",
      })
    }
  }, [])

  // アニメーションのクリーンアップ
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
      if (currentAnimation) {
        setCurrentAnimation(null)
      }
    }
  }, [currentAnimation])

  // 週の開始日と終了日（月曜日スタート）
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // 1は月曜日
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })

  // 週の日付を配列で取得
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // 今日の日付
  const today = new Date()

  // 週のタスクを取得
  useEffect(() => {
    const filteredTasks = tasks.filter((task) => {
      if (!task.dueDate) return false

      // dueDate を安全に Date オブジェクトに変換
      const dueDate = toSafeDate(task.dueDate)

      // 無効な日付の場合はスキップ
      if (!dueDate) return false

      return dueDate >= weekStart && dueDate <= weekEnd
    })
    setWeekTasks(filteredTasks)

    // 完了率を計算
    if (filteredTasks.length > 0) {
      const completedCount = filteredTasks.filter((task) => task.status === "complete").length
      setCompletionRate(Math.round((completedCount / filteredTasks.length) * 100))
    } else {
      setCompletionRate(0)
    }
  }, [tasks, weekStart.toISOString(), weekEnd.toISOString()])

  // 日付ごとのタスクを取得
  const getTasksForDate = useCallback(
    (date: Date) => {
      return weekTasks.filter((task) => {
        if (!task.dueDate) return false

        // dueDate を安全に Date オブジェクトに変換
        const dueDate = toSafeDate(task.dueDate)

        // 無効な日付の場合はスキップ
        if (!dueDate) return false

        return isSameDate(dueDate, date)
      })
    },
    [weekTasks],
  )

  // アニメーション再生関数を先に定義
  const playCompletionAnimation = useCallback(() => {
    // アニメーションの種類をランダムに選択
    const animations = ["fireworks", "confetti", "stars"]
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)]

    // 現在のアニメーションをセット
    setCurrentAnimation(randomAnimation)

    // アニメーション終了後にnullに戻す
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    animationTimeoutRef.current = setTimeout(() => {
      setCurrentAnimation(null)
      animationTimeoutRef.current = null
    }, 2000)
  }, [])

  // タスクのステータスを変更する関数
  const handleStatusChange = useCallback(
    (taskId: string, status: "complete" | "partial" | "incorrect" | null) => {
      // 現在のタスクを取得
      const task = weekTasks.find((t) => t.id === taskId)
      if (!task) return

      // 同じステータスをクリックした場合はnullに戻す
      const newStatus = task.status === status ? null : status

      // タスクを更新
      updateTask(taskId, { status: newStatus })

      // 完答に変更された場合、アニメーションを表示
      if (newStatus === "complete" && showAnimation) {
        // アニメーションを直接再生
        playCompletionAnimation()
      }

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
    [weekTasks, updateTask, showAnimation, playCompletionAnimation],
  )

  // タスクを翌日に繰り越す
  const handlePostponeTask = useCallback(
    (taskId: string) => {
      const task = weekTasks.find((t) => t.id === taskId)
      if (task && task.dueDate) {
        // dueDate を安全に Date オブジェクトに変換
        const dueDate = toSafeDate(task.dueDate)
        if (dueDate) {
          const nextDay = addDays(dueDate, 1)
          updateTask(taskId, {
            dueDate: nextDay,
            originalDate: task.originalDate || task.dueDate,
          })
        }
      }
    },
    [weekTasks, updateTask],
  )

  // 別日に繰り越す
  const handlePostponeToDate = useCallback(
    (taskId: string, date: Date) => {
      const task = weekTasks.find((t) => t.id === taskId)
      if (task && task.dueDate) {
        updateTask(taskId, {
          dueDate: date,
          originalDate: task.originalDate || task.dueDate,
        })
      }
    },
    [weekTasks, updateTask],
  )

  // アニメーション再生関数を修正
  // const playCompletionAnimation = useCallback(() => {
  //   // アニメーションの種類をランダムに選択
  //   const animations = ["fireworks", "confetti", "stars"]
  //   const randomAnimation = animations[Math.floor(Math.random() * animations.length)]
  //
  //   // 現在のアニメーションをセット
  //   setCurrentAnimation(randomAnimation)
  //
  //   // アニメーション終了後にnullに戻す
  //   if (animationTimeoutRef.current) {
  //     clearTimeout(animationTimeoutRef.current)
  //   }
  //
  //   animationTimeoutRef.current = setTimeout(() => {
  //     setCurrentAnimation(null)
  //     animationTimeoutRef.current = null
  //   }, 2000)
  // }, [])

  // 以下のイベントリスナー部分は削除（直接呼び出しに変更したため）
  // useEffect(() => {
  //   const handleShowAnimation = () => {
  //     playCompletionAnimation()
  //   }
  //
  //   window.addEventListener("show-completion-animation", handleShowAnimation)
  //
  //   return () => {
  //     window.removeEventListener("show-completion-animation", handleShowAnimation)
  //   }
  // }, [playCompletionAnimation])

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-center">
          {format(weekStart, "M月d日", { locale: ja })} 〜 {format(weekEnd, "M月d日", { locale: ja })}
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
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

      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today)
          const dayTasks = getTasksForDate(day)
          const hasTask = dayTasks.length > 0
          const completedTasks = dayTasks.filter((task) => task.status === "complete").length
          const completionPercentage = hasTask ? Math.round((completedTasks / dayTasks.length) * 100) : 0

          return (
            <div
              key={i}
              className={cn(
                "border rounded-md p-2 text-center",
                isToday ? "bg-blue-50 border-blue-300" : "bg-white",
                hasTask ? "cursor-pointer hover:bg-gray-50" : "",
              )}
            >
              <div className="font-medium">{format(day, "d")}</div>
              {hasTask && (
                <div className="mt-1">
                  <div className="text-xs text-gray-500">
                    {completedTasks}/{dayTasks.length}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="space-y-4">
        {weekDays.map((day, i) => {
          const dayTasks = getTasksForDate(day)
          if (dayTasks.length === 0) return null

          return (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-medium mb-3 flex items-center">
                <span
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mr-2 text-white",
                    isSameDay(day, today) ? "bg-blue-500" : "bg-gray-500",
                  )}
                >
                  {format(day, "d")}
                </span>
                <span>
                  {format(day, "M月d日", { locale: ja })}（{format(day, "E", { locale: ja })}）
                </span>
              </h4>

              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    showOriginalDate={true}
                    onPostpone={() => handlePostponeTask(task.id)}
                    onPostponeToDate={(date) => handlePostponeToDate(task.id, date)}
                    onStatusChange={(status) => handleStatusChange(task.id, status)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {weekTasks.length === 0 && (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <p>この週のタスクはありません</p>
          <Button variant="outline" className="mt-2">
            タスクを追加
          </Button>
        </div>
      )}
      {currentAnimation && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          {currentAnimation === "fireworks" && (
            <div className="animation-container">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="firework"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 1.5}s`,
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                  }}
                />
              ))}
            </div>
          )}

          {currentAnimation === "confetti" && (
            <div className="animation-container">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className="confetti"
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

          {currentAnimation === "stars" && (
            <div className="animation-container">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="star"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                    fontSize: `${Math.random() * 20 + 10}px`,
                  }}
                >
                  ★
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
