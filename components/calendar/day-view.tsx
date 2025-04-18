"use client"

import { useState, useEffect, useCallback } from "react"
import { format, isSameDay, addDays } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle, CheckCircle, Circle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SparkTask } from "@/types/task"
import { useTaskContext } from "@/contexts/task-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMobile } from "@/hooks/use-mobile"
import { toast } from "@/components/ui/use-toast"
import { TaskItem } from "./task-item"
import { toSafeDate } from "@/utils/date-utils"
import React from "react"

interface DayViewProps {
  currentDate: Date
}

export function DayView({ currentDate }: DayViewProps) {
  const { tasks, updateTask } = useTaskContext()
  const [dayTasks, setDayTasks] = useState<SparkTask[]>([])
  const [showPostponeDialog, setShowPostponeDialog] = useState(false)
  const [hasIncompleteTasks, setHasIncompleteTasks] = useState(false)
  const [completionRate, setCompletionRate] = useState(0)
  const [showAnimation, setShowAnimation] = useState(true)
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const isMobile = useMobile()

  // 問題集の情報を取得
  const [bookTitles, setBookTitles] = useState<Record<string, string>>({})

  // アニメーション再生関数を先に定義
  const playCompletionAnimation = useCallback(() => {
    const animations = ["confetti", "stars", "sakura"]
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)]
    setCurrentAnimation(randomAnimation)

    setTimeout(() => {
      setCurrentAnimation(null)
    }, 3000)
  }, [])

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

  // スパークからの更新を監視
  useEffect(() => {
    const handleSparkTasksUpdated = () => {
      // スパークタスクが更新されたら、カレンダータスクを再読み込み
      const calendarTasksStr = localStorage.getItem("calendar_tasks")
      if (calendarTasksStr) {
        try {
          const calendarTasks = JSON.parse(calendarTasksStr, (key, value) => {
            if (key === "dueDate" || key === "originalDate") {
              return value ? new Date(value) : null
            }
            return value
          })

          // TaskContextのタスクを更新
          updateTaskContext(calendarTasks)
        } catch (e) {
          console.error("Failed to update calendar tasks from spark", e)
        }
      }
    }

    // カスタムイベントリスナーを追加
    window.addEventListener("spark-tasks-updated", handleSparkTasksUpdated)

    return () => {
      window.removeEventListener("spark-tasks-updated", handleSparkTasksUpdated)
    }
  }, [tasks, updateTask])

  // TaskContextのタスクを更新する関数
  const updateTaskContext = (newTasks: SparkTask[]) => {
    // 現在のタスクを保持しつつ、スパークタスクのステータスを更新
    const updatedTasks = tasks.map((task) => {
      // スパークタスクの場合
      if (task.id.startsWith("spark-")) {
        // 新しいタスクリストから対応するタスクを探す
        const updatedTask = newTasks.find((t) => t.id === task.id)

        if (updatedTask) {
          return {
            ...task,
            status: updatedTask.status,
          }
        }
      }
      return task
    })

    // TaskContextのタスクを更新
    updateTask("", { tasks: updatedTasks })
  }

  // 現在の日付のタスクを取得
  useEffect(() => {
    const filteredTasks = tasks.filter((task) => {
      if (!task.dueDate) return false

      // 修正: toSafeDate関数を使用して安全にDate型に変換
      const dueDate = toSafeDate(task.dueDate)

      // 無効な日付の場合はスキップ
      if (!dueDate) return false

      return (
        dueDate.getFullYear() === currentDate.getFullYear() &&
        dueDate.getMonth() === currentDate.getMonth() &&
        dueDate.getDate() === currentDate.getDate()
      )
    })
    setDayTasks(filteredTasks)

    // 未完了タスクがあるかチェック
    const incomplete = filteredTasks.some((task) => task.status !== "complete")
    setHasIncompleteTasks(incomplete)

    // 完了率を計算
    if (filteredTasks.length > 0) {
      const completedCount = filteredTasks.filter((task) => task.status === "complete").length
      setCompletionRate(Math.round((completedCount / filteredTasks.length) * 100))
    } else {
      setCompletionRate(0)
    }

    // 23時以降で未完了タスクがある場合、アラートを表示
    const currentHour = new Date().getHours()
    if (currentHour >= 23 && incomplete && isSameDay(currentDate, new Date())) {
      setShowPostponeDialog(true)
    }
  }, [currentDate.toISOString(), tasks])

  // 科目ごとにタスクをグループ化
  const groupedTasks: Record<string, SparkTask[]> = {}
  dayTasks.forEach((task) => {
    if (!groupedTasks[task.subject]) {
      groupedTasks[task.subject] = []
    }
    groupedTasks[task.subject].push(task)
  })

  // 未完了タスクを翌日に繰り越す
  const handlePostponeTasks = () => {
    dayTasks.forEach((task) => {
      if (task.status !== "complete" && task.dueDate) {
        // 修正: toSafeDate関数を使用して安全にDate型に変換
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
  }

  // 個別のタスクを翌日に繰り越す
  const handlePostponeTask = (taskId: string) => {
    const task = dayTasks.find((t) => t.id === taskId)
    if (task && task.dueDate) {
      // 修正: toSafeDate関数を使用して安全にDate型に変換
      const dueDate = toSafeDate(task.dueDate)
      if (dueDate) {
        const nextDay = addDays(dueDate, 1)
        updateTask(taskId, {
          dueDate: nextDay,
          originalDate: task.originalDate || task.dueDate,
        })
      }
    }
  }

  // 別日に繰り越す機能を追加
  const handlePostponeToDate = (taskId: string, date: Date) => {
    const task = dayTasks.find((t) => t.id === taskId)
    if (task && task.dueDate) {
      updateTask(taskId, {
        dueDate: date,
        originalDate: task.originalDate || task.dueDate,
      })

      toast({
        title: "タスクを繰り越しました",
        description: `${format(date, "M月d日")}に繰り越しました`,
        duration: 3000,
      })
    }
  }

  // スパークデータ更新を別関数に分離して明確化
  const updateSparkData = useCallback((taskId: string, newStatus: "complete" | "partial" | "incorrect" | null) => {
    // spark-1-30 のような形式からchapterIdとproblemIdを抽出
    const parts = taskId.split("-")
    if (parts.length < 3) {
      console.error(`[day-view] Invalid task ID format: ${taskId}`)
      return
    }

    const chapterId = Number.parseInt(parts[1])
    const problemId = Number.parseInt(parts[2])

    if (isNaN(chapterId) || isNaN(problemId)) {
      console.error(`[day-view] Invalid chapter or problem ID: ${taskId}`)
      return
    }

    console.log(`[day-view] Extracted chapterId: ${chapterId}, problemId: ${problemId}`)

    // スパークリストのデータを取得
    const sparkTaskData = localStorage.getItem("spark_task_data")
    if (!sparkTaskData) {
      console.log("[day-view] No spark_task_data found")
      return
    }

    try {
      const parsedData = JSON.parse(sparkTaskData)

      // データ構造を確認
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        console.error("[day-view] Invalid spark_task_data format")
        return
      }

      let updatedData
      let dataUpdated = false

      // 日付ベースのデータ形式（plannedTaskData）の場合
      if (parsedData[0].hasOwnProperty("date") || parsedData[0].hasOwnProperty("chapter")) {
        console.log("[day-view] Detected date-based data format")

        updatedData = parsedData.map((dayTask) => {
          // 各日のタスクを処理
          if (!dayTask.problems || !Array.isArray(dayTask.problems)) {
            return dayTask
          }

          // 問題配列のコピーを作成
          const updatedProblems = [...dayTask.problems]

          // 特定の問題IDのみを更新
          let problemUpdated = false
          for (let i = 0; i < updatedProblems.length; i++) {
            // 厳密に問題IDを比較
            if (updatedProblems[i].id === problemId) {
              console.log(`[day-view] Found problem ${problemId} in day task`)

              // 問題のステータスを更新
              updatedProblems[i] = {
                ...updatedProblems[i],
                status: newStatus,
                lastUpdated: newStatus ? new Date().toISOString() : null,
              }

              problemUpdated = true
              dataUpdated = true
            }
          }

          // 問題が更新された場合のみ新しい配列を返す
          if (problemUpdated) {
            return {
              ...dayTask,
              problems: updatedProblems,
            }
          }
          return dayTask
        })
      }
      // チャプターベースのデータ形式（chapterBasedData）の場合
      else {
        console.log("[day-view] Detected chapter-based data format")

        updatedData = parsedData.map((chapter) => {
          // 厳密にチャプターIDを比較
          if (chapter.id !== chapterId) {
            return chapter
          }

          console.log(`[day-view] Found chapter ${chapterId}`)

          // セクションがない場合は何もしない
          if (!chapter.sections || !Array.isArray(chapter.sections)) {
            return chapter
          }

          let chapterUpdated = false
          const updatedSections = chapter.sections.map((section) => {
            // 問題がない場合は何もしない
            if (!section.problems || !Array.isArray(section.problems)) {
              return section
            }

            // 問題配列のコピーを作成
            const updatedProblems = [...section.problems]

            // 特定の問題IDのみを更新
            let sectionUpdated = false
            for (let i = 0; i < updatedProblems.length; i++) {
              // 厳密に問題IDを比較
              if (updatedProblems[i].id === problemId) {
                console.log(`[day-view] Found problem ${problemId} in section ${section.id}`)

                // 問題のステータスを更新
                updatedProblems[i] = {
                  ...updatedProblems[i],
                  status: newStatus,
                  lastUpdated: newStatus ? new Date().toISOString() : null,
                }

                sectionUpdated = true
                chapterUpdated = true
                dataUpdated = true
              }
            }

            // セクションが更新された場合のみ新しい配列を返す
            if (sectionUpdated) {
              return {
                ...section,
                problems: updatedProblems,
              }
            }
            return section
          })

          // チャプターが更新された場合のみ新しい配列を返す
          if (chapterUpdated) {
            return {
              ...chapter,
              sections: updatedSections,
            }
          }
          return chapter
        })
      }

      // データが更新された場合のみ保存
      if (dataUpdated) {
        console.log("[day-view] Saving updated spark_task_data")
        localStorage.setItem("spark_task_data", JSON.stringify(updatedData))

        // スパークタスク更新イベントを発火
        window.dispatchEvent(new CustomEvent("calendar-tasks-updated"))
      } else {
        console.log("[day-view] No changes made to spark_task_data")
      }
    } catch (error) {
      console.error("[day-view] Failed to update spark task data:", error)
    }
  }, [])

  // useCallbackを使用して関数を最適化します
  const handleStatusChange = useCallback(
    (taskId: string, status: "complete" | "partial" | "incorrect" | null) => {
      console.log(`[day-view] Updating task ${taskId} to status: ${status}`)

      // タッチフィードバックのためにアクティブなタスクIDを設定
      setActiveTaskId(taskId)
      setTimeout(() => setActiveTaskId(null), 300)

      // 現在のタスクを取得
      const task = dayTasks.find((t) => t.id === taskId)
      if (!task) {
        console.error(`[day-view] Task with id ${taskId} not found`)
        return
      }

      // 同じステータスをクリックした場合はnullに戻す
      const newStatus = task.status === status ? null : status
      console.log(`[day-view] Current status: ${task.status}, New status: ${newStatus}`)

      // 即座にUIを更新するために状態を更新
      setDayTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))

      // カレンダータスクを更新
      updateTask(taskId, { status: newStatus })

      // スパークリストのデータも更新
      if (taskId.startsWith("spark-")) {
        updateSparkData(taskId, newStatus)
      }

      // 完答をクリックした場合かつアニメーションが有効な場合、かつ新しいステータスが完答の場合のみアニメーション表示
      if (newStatus === "complete" && showAnimation) {
        playCompletionAnimation()
      }
    },
    [dayTasks, updateTask, showAnimation, playCompletionAnimation, updateSparkData],
  )

  // アニメーションのクリーンアップ用のuseEffectを追加:
  useEffect(() => {
    return () => {
      if (currentAnimation) {
        setCurrentAnimation(null)
      }
    }
  }, [currentAnimation])

  // タスクの状態別カウント
  const taskCounts = {
    total: dayTasks.length,
    complete: dayTasks.filter((task) => task.status === "complete").length,
    partial: dayTasks.filter((task) => task.status === "partial").length,
    incorrect: dayTasks.filter((task) => task.status === "incorrect").length,
    pending: dayTasks.filter((task) => task.status === null).length,
  }

  // メモ化を使用して不要な再レンダリングを防ぎます
  const TaskStatusIcon = React.memo(({ task }: { task: SparkTask }) => {
    if (task.status === "complete") {
      return (
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
          <CheckCircle className="h-4 w-4" />
        </div>
      )
    } else if (task.status === "partial") {
      return (
        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
          <AlertTriangle className="h-4 w-4" />
        </div>
      )
    } else if (task.status === "incorrect") {
      return (
        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-500">
          <Circle className="h-4 w-4" />
        </div>
      )
    } else {
      return (
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
          <Circle className="h-4 w-4" />
        </div>
      )
    }
  })

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-center">{format(currentDate, "M月d日 (E)", { locale: ja })}のタスク</h3>
      </div>

      {/* 進捗状況サマリー - 改善版 */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">今日の進捗</h4>
          <span className="text-sm text-gray-500">{completionRate}% 完了</span>
        </div>

        {/* 改善された進捗バー - メモリ付き、太さ増加、視認性向上、グラデーション色 */}
        <div className="relative w-full h-6 bg-gray-200 rounded-full mb-4 overflow-hidden">
          {/* メモリマーク */}
          <div className="absolute top-0 bottom-0 left-1/4 w-px bg-gray-400 z-10"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-400 z-10"></div>
          <div className="absolute top-0 bottom-0 left-3/4 w-px bg-gray-400 z-10"></div>

          {/* パーセント表示 - 位置調整と視認性向上 */}
          <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium bg-white px-1 rounded-sm shadow-sm z-20">
            25%
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium bg-white px-1 rounded-sm shadow-sm z-20">
            50%
          </div>
          <div className="absolute top-1/2 left-3/4 transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium bg-white px-1 rounded-sm shadow-sm z-20">
            75%
          </div>

          {/* プログレスバー - グラデーション色に変更 */}
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div className="bg-blue-50 p-2 rounded">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
              <span className="font-medium">{taskCounts.complete}</span>
            </div>
            <span className="text-xs text-gray-600">完答</span>
          </div>
          <div className="bg-amber-50 p-2 rounded">
            <div className="flex items-center justify-center mb-1">
              <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
              <span className="font-medium">{taskCounts.partial}</span>
            </div>
            <span className="text-xs text-gray-600">一部正解</span>
          </div>
          <div className="bg-red-50 p-2 rounded">
            <div className="flex items-center justify-center mb-1">
              <Circle className="h-4 w-4 text-red-500 mr-1" />
              <span className="font-medium">{taskCounts.incorrect}</span>
            </div>
            <span className="text-xs text-gray-600">誤答</span>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="flex items-center justify-center mb-1">
              <Circle className="h-4 w-4 text-gray-300 mr-1" />
              <span className="font-medium">{taskCounts.pending}</span>
            </div>
            <span className="text-xs text-gray-600">未着手</span>
          </div>
        </div>
      </div>

      {/* 科目ごとのタスク表示 - 週表示のデザインを適用 */}
      {Object.entries(groupedTasks).map(([subject, subjectTasks]) => (
        <div key={subject} className="mb-6">
          <h4 className="text-md font-medium mb-2 text-gray-700 flex items-center">
            <div className={cn("w-3 h-3 rounded-full mr-2", subject === "数学" ? "bg-blue-500" : "bg-green-500")}></div>
            {/* 科目名を問題集名に置き換え - 明示的に表示 */}
            {subject === "数学" ? bookTitles["数学"] || "数学" : subject}
          </h4>
          <div className="space-y-2">
            {subjectTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                showOriginalDate={true}
                onPostpone={() => {
                  // 翌日に繰り越す
                  if (task.dueDate) {
                    // 修正: toSafeDate関数を使用して安全にDate型に変換
                    const dueDate = toSafeDate(task.dueDate)
                    if (dueDate) {
                      const nextDay = addDays(dueDate, 1)
                      handlePostponeToDate(task.id, nextDay)
                    }
                  }
                }}
                onPostponeToDate={(date) => handlePostponeToDate(task.id, date)}
                onStatusChange={(status) => handleStatusChange(task.id, status)}
              />
            ))}
          </div>
        </div>
      ))}

      {dayTasks.length === 0 && (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <p>今日のタスクはありません</p>
          <Button variant="outline" className="mt-2">
            <Plus className="h-4 w-4 mr-1" /> タスクを追加
          </Button>
        </div>
      )}

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

      {currentAnimation && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
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
                    textShadow: `0 0 ${Math.random() * 10 + 5}px hsl(${Math.random() * 360}, 100%, 70%)`,
                  }}
                >
                  ★
                </div>
              ))}
            </div>
          )}

          {currentAnimation === "sakura" && (
            <div className="animation-container">
              {Array.from({ length: 80 }).map((_, i) => (
                <div
                  key={i}
                  className="sakura-petal"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}%`,
                    width: `${Math.random() * 15 + 10}px`,
                    height: `${Math.random() * 15 + 10}px`,
                    backgroundColor: `hsl(${350 + Math.random() * 20}, ${90 + Math.random() * 10}%, ${
                      85 + Math.random() * 10
                    }%)`,
                    borderRadius: "50% 0 50% 0",
                    transform: `rotate(${Math.random() * 360}deg)`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${Math.random() * 5 + 5}s`,
                    opacity: 0.9,
                    boxShadow: "0 0 10px 2px rgba(255, 183, 197, 0.5)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* アニメーションのためのスタイル */}
      <style jsx global>{`
        .confetti {
          position: absolute;
          top: -20px;
          animation: confetti-fall linear forwards;
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
          }
        }
        .star {
          position: absolute;
          animation: star-fade 2s forwards;
        }
        @keyframes star-fade {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        .sakura-petal {
          position: absolute;
          animation: sakura-fall linear forwards;
        }
        @keyframes sakura-fall {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
          }
        }
      `}</style>
    </div>
  )
}
