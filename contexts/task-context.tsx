"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Task } from "@/types/models"
import { getTaskRepository } from "@/lib/repository-utils"
import { useAuth } from "./auth-context"
import { toast } from "@/components/ui/use-toast"

interface TaskContextType {
  tasks: Task[]
  isLoading: boolean
  error: Error | null
  stats: {
    total: number
    completed: number
    partial: number
    incorrect: number
    pending: number
  }
  fetchTasks: () => Promise<void>
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  filterTasks: (filter: {
    subject?: string
    status?: Task["status"]
    dateRange?: {
      start: Date
      end: Date
    }
    tags?: string[]
  }) => Promise<Task[]>
  getTasksByDate: (date: Date) => Promise<Task[]>
  generateTaskSchedule: (startDate: Date, endDate: Date) => Promise<void>
  updateSparkData: (taskId: string, newStatus: Task["status"]) => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [stats, setStats] = useState<TaskContextType["stats"]>({
    total: 0,
    completed: 0,
    partial: 0,
    incorrect: 0,
    pending: 0,
  })

  const { user } = useAuth()
  const taskRepository = getTaskRepository(user?.id)

  // タスク一覧を取得
  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const fetchedTasks = await taskRepository.findAll()
      setTasks(fetchedTasks)

      // 統計情報も更新
      const fetchedStats = await taskRepository.getStatistics()
      setStats(fetchedStats)
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
      setError(err instanceof Error ? err : new Error("タスクの取得に失敗しました"))
    } finally {
      setIsLoading(false)
    }
  }, [taskRepository])

  // 初期化時にタスクを読み込む
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // タスクを追加
  const addTask = useCallback(
    async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      try {
        setIsLoading(true)
        setError(null)

        await taskRepository.create(task)
        await fetchTasks() // 最新のタスク一覧を再取得

        toast({
          title: "タスクを追加しました",
          duration: 3000,
        })
      } catch (err) {
        console.error("Failed to add task:", err)
        setError(err instanceof Error ? err : new Error("タスクの追加に失敗しました"))

        toast({
          title: "タスクの追加に失敗しました",
          description: err instanceof Error ? err.message : "エラーが発生しました",
          variant: "destructive",
          duration: 5000,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [taskRepository, fetchTasks],
  )

  // タスクを更新
  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      try {
        setIsLoading(true)
        setError(null)

        await taskRepository.update(taskId, updates)
        await fetchTasks() // 最新のタスク一覧を再取得

        // タスク更新イベントを発火
        window.dispatchEvent(new CustomEvent("calendar-tasks-updated"))
      } catch (err) {
        console.error("Failed to update task:", err)
        setError(err instanceof Error ? err : new Error("タスクの更新に失敗しました"))

        toast({
          title: "タスクの更新に失敗しました",
          description: err instanceof Error ? err.message : "エラーが発生しました",
          variant: "destructive",
          duration: 5000,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [taskRepository, fetchTasks],
  )

  // タスクを削除
  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        setIsLoading(true)
        setError(null)

        await taskRepository.delete(taskId)
        await fetchTasks() // 最新のタスク一覧を再取得

        toast({
          title: "タスクを削除しました",
          duration: 3000,
        })
      } catch (err) {
        console.error("Failed to delete task:", err)
        setError(err instanceof Error ? err : new Error("タスクの削除に失敗しました"))

        toast({
          title: "タスクの削除に失敗しました",
          description: err instanceof Error ? err.message : "エラーが発生しました",
          variant: "destructive",
          duration: 5000,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [taskRepository, fetchTasks],
  )

  // タスクをフィルタリング
  const filterTasks = useCallback(
    async (filter: {
      subject?: string
      status?: Task["status"]
      dateRange?: {
        start: Date
        end: Date
      }
      tags?: string[]
    }): Promise<Task[]> => {
      try {
        setError(null)

        let filteredTasks = await taskRepository.findAll()

        // 科目フィルター
        if (filter.subject) {
          filteredTasks = await taskRepository.findBySubject(filter.subject)
        }

        // ステータスフィルター
        if (filter.status !== undefined) {
          filteredTasks = await taskRepository.findByStatus(filter.status)
        }

        // 日付範囲フィルター
        if (filter.dateRange) {
          filteredTasks = await taskRepository.findByDateRange(filter.dateRange.start, filter.dateRange.end)
        }

        // タグフィルター
        if (filter.tags && filter.tags.length > 0) {
          // 複数タグの場合は、各タグでフィルタリングした結果を結合
          const tagFilteredTasks = await Promise.all(filter.tags.map((tag) => taskRepository.findByTag(tag)))

          // 重複を除去
          const uniqueTasks = new Map<string, Task>()
          tagFilteredTasks.flat().forEach((task) => {
            uniqueTasks.set(task.id, task)
          })

          filteredTasks = Array.from(uniqueTasks.values())
        }

        return filteredTasks
      } catch (err) {
        console.error("Failed to filter tasks:", err)
        setError(err instanceof Error ? err : new Error("タスクのフィルタリングに失敗しました"))
        return []
      }
    },
    [taskRepository],
  )

  // 日付でタスクを取得
  const getTasksByDate = useCallback(
    async (date: Date): Promise<Task[]> => {
      try {
        setError(null)
        return await taskRepository.findByDate(date)
      } catch (err) {
        console.error("Failed to get tasks by date:", err)
        setError(err instanceof Error ? err : new Error("日付によるタスクの取得に失敗しました"))
        return []
      }
    },
    [taskRepository],
  )

  // スパークタスクを平坦化する関数
  const flattenSparkTasks = (
    parsedSparkData: any[],
  ): Array<{ id: string; title: string; subject: string; status: string | null }> => {
    const sparkTasks: Array<{ id: string; title: string; subject: string; status: string | null }> = []

    parsedSparkData.forEach((chapter: any) => {
      const chapterTitle = chapter.chapter
      const sectionTitle = chapter.section
      const date = chapter.date || ""

      chapter.problems.forEach((problem: any) => {
        sparkTasks.push({
          id: `spark-${chapter.id}-${problem.id}`,
          title: `${chapterTitle} - ${sectionTitle} - 問題${problem.id}`,
          subject: "数学", // デフォルトは数学
          status: problem.status,
        })
      })
    })

    return sparkTasks
  }

  // 復習日の設定を取得する関数
  const getReviewDays = (): { [key: string]: boolean } => {
    const reviewDaysStr = localStorage.getItem("review_days")
    let reviewDays: { [key: string]: boolean } = {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: true, // デフォルトは日曜日
    }

    if (reviewDaysStr) {
      try {
        reviewDays = JSON.parse(reviewDaysStr)
      } catch (e) {
        console.error("Failed to parse review days", e)
      }
    }

    return reviewDays
  }

  // タスクを日付ごとに割り振る関数
  const distributeTasksByDate = (
    sparkTasks: Array<{ id: string; title: string; subject: string; status: string | null }>,
    startDate: Date,
    endDate: Date,
    tasksPerDay: number,
    reviewDays: { [key: string]: boolean },
    userId?: string,
  ): Omit<Task, "id" | "createdAt" | "updatedAt">[] => {
    const newTasks: Omit<Task, "id" | "createdAt" | "updatedAt">[] = []
    let taskIndex = 0
    const currentDate = new Date(startDate)
    const dayMapping = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

    while (taskIndex < sparkTasks.length && currentDate <= endDate) {
      // 現在の曜日が復習日かどうかをチェック
      const dayOfWeek = currentDate.getDay()
      const dayName = dayMapping[dayOfWeek]

      // 復習日でない場合のみタスクを割り当て
      if (!reviewDays[dayName as keyof typeof reviewDays]) {
        // その日に割り当てるタスク数
        const tasksForToday = Math.min(tasksPerDay, sparkTasks.length - taskIndex)

        for (let i = 0; i < tasksForToday; i++) {
          if (taskIndex < sparkTasks.length) {
            const task = sparkTasks[taskIndex]
            newTasks.push({
              title: task.title,
              subject: task.subject,
              status: task.status as Task["status"],
              dueDate: new Date(currentDate),
              userId: userId,
            })
            taskIndex++
          }
        }
      }

      // 次の日に進む
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return newTasks
  }

  // スパークタスクを自動割り振り
  const generateTaskSchedule = useCallback(
    async (startDate: Date, endDate: Date) => {
      try {
        setIsLoading(true)
        setError(null)

        // スパークから取得したタスクデータ
        const sparkTaskData = localStorage.getItem("spark_task_data")
        if (!sparkTaskData) {
          throw new Error("No spark task data found")
        }

        const parsedSparkData = JSON.parse(sparkTaskData)

        // スパークタスクを平坦化して配列に変換
        const sparkTasks = flattenSparkTasks(parsedSparkData)

        // 日付の範囲を計算
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

        // 1日あたりのタスク数を計算（均等に分配）
        const tasksPerDay = Math.ceil(sparkTasks.length / days)

        // 復習日の設定を取得
        const reviewDays = getReviewDays()

        // タスクを日付ごとに割り振り
        const newTasks = distributeTasksByDate(sparkTasks, startDate, endDate, tasksPerDay, reviewDays, user?.id)

        // 既存のタスクから自動生成されたタスク（spark-*のID）を除外
        const existingTasks = await taskRepository.findAll()
        const filteredTasks = existingTasks.filter((task) => !task.id.startsWith("spark-"))

        // 既存のタスクを削除（spark-*のIDのみ）
        for (const task of existingTasks) {
          if (task.id.startsWith("spark-")) {
            await taskRepository.delete(task.id)
          }
        }

        // 新しいタスクを追加
        for (const task of newTasks) {
          await taskRepository.create(task)
        }

        await fetchTasks() // 最新のタスク一覧を再取得

        toast({
          title: "タスクスケジュールを生成しました",
          description: `${newTasks.length}個のタスクをカレンダーに割り振りました。`,
          duration: 3000,
        })
      } catch (err) {
        console.error("Failed to generate task schedule:", err)
        setError(err instanceof Error ? err : new Error("タスクスケジュールの生成に失敗しました"))

        toast({
          title: "タスクスケジュールの生成に失敗しました",
          description: err instanceof Error ? err.message : "エラーが発生しました",
          variant: "destructive",
          duration: 5000,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [taskRepository, fetchTasks, user],
  )

  // スパークデータを更新
  const updateSparkData = useCallback(async (taskId: string, newStatus: Task["status"]) => {
    try {
      // spark-1-30 のような形式からchapterIdとproblemIdを抽出
      const parts = taskId.split("-")
      if (parts.length < 3) {
        console.error(`Invalid task ID format: ${taskId}`)
        return
      }

      const chapterId = Number.parseInt(parts[1])
      const problemId = Number.parseInt(parts[2])

      if (isNaN(chapterId) || isNaN(problemId)) {
        console.error(`Invalid chapter or problem ID: ${taskId}`)
        return
      }

      // スパークリストのデータを取得
      const sparkTaskData = localStorage.getItem("spark_task_data")
      if (!sparkTaskData) {
        console.log("No spark_task_data found")
        return
      }

      try {
        const parsedData = JSON.parse(sparkTaskData)

        // データ構造を確認
        if (!Array.isArray(parsedData) || parsedData.length === 0) {
          console.error("Invalid spark_task_data format")
          return
        }

        let updatedData
        let dataUpdated = false

        // 日付ベースのデータ形式（plannedTaskData）の場合
        if (parsedData[0].hasOwnProperty("date") || parsedData[0].hasOwnProperty("chapter")) {
          updatedData = parsedData.map((dayTask: any) => {
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
          updatedData = parsedData.map((chapter: any) => {
            // 厳密にチャプターIDを比較
            if (chapter.id !== chapterId) {
              return chapter
            }

            // セクションがない場合は何もしない
            if (!chapter.sections || !Array.isArray(chapter.sections)) {
              return chapter
            }

            let chapterUpdated = false
            const updatedSections = chapter.sections.map((section: any) => {
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
          localStorage.setItem("spark_task_data", JSON.stringify(updatedData))

          // スパークタスク更新イベントを発火
          window.dispatchEvent(new CustomEvent("calendar-tasks-updated"))
        }
      } catch (error) {
        console.error("Failed to update spark task data:", error)
      }
    } catch (err) {
      console.error("Failed to update spark data:", err)
      setError(err instanceof Error ? err : new Error("スパークデータの更新に失敗しました"))
    }
  }, [])

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        error,
        stats,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        filterTasks,
        getTasksByDate,
        generateTaskSchedule,
        updateSparkData,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const context = useContext(TaskContext)

  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider")
  }

  return context
}

// 後方互換性のために残しておく
export function useTask() {
  return useTaskContext()
}
