import { defaultStorage } from "@/lib/storage-adapter"
import type { SparkTask, TaskFilter } from "@/types/task"

const TASKS_STORAGE_KEY = "calendar_tasks"

/**
 * タスク一覧を取得
 */
export async function getTasks(): Promise<SparkTask[]> {
  try {
    const tasks = await defaultStorage.getItem<SparkTask[]>(TASKS_STORAGE_KEY)
    return tasks || []
  } catch (error) {
    console.error("Error getting tasks:", error)
    return []
  }
}

/**
 * タスクを追加
 */
export async function addTask(task: SparkTask): Promise<SparkTask> {
  try {
    const tasks = await getTasks()
    const newTasks = [...tasks, task]
    await defaultStorage.setItem(TASKS_STORAGE_KEY, newTasks)
    return task
  } catch (error) {
    console.error("Error adding task:", error)
    throw error
  }
}

/**
 * タスクを更新
 */
export async function updateTask(task: SparkTask): Promise<SparkTask> {
  try {
    const tasks = await getTasks()
    const taskIndex = tasks.findIndex((t) => t.id === task.id)

    if (taskIndex === -1) {
      throw new Error(`Task with id ${task.id} not found`)
    }

    const newTasks = [...tasks]
    newTasks[taskIndex] = task
    await defaultStorage.setItem(TASKS_STORAGE_KEY, newTasks)
    return task
  } catch (error) {
    console.error("Error updating task:", error)
    throw error
  }
}

/**
 * タスクを削除
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    const tasks = await getTasks()
    const newTasks = tasks.filter((task) => task.id !== taskId)
    await defaultStorage.setItem(TASKS_STORAGE_KEY, newTasks)
  } catch (error) {
    console.error("Error deleting task:", error)
    throw error
  }
}

/**
 * タスクをフィルタリング
 */
export async function filterTasks(filter: TaskFilter): Promise<SparkTask[]> {
  try {
    const tasks = await getTasks()
    let filteredTasks = [...tasks]

    if (filter.subject) {
      filteredTasks = filteredTasks.filter((task) => task.subject === filter.subject)
    }

    if (filter.status) {
      filteredTasks = filteredTasks.filter((task) => task.status === filter.status)
    }

    if (filter.dateRange) {
      filteredTasks = filteredTasks.filter((task) => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        const startDate = filter.dateRange?.start ? new Date(filter.dateRange.start) : null
        const endDate = filter.dateRange?.end ? new Date(filter.dateRange.end) : null

        if (startDate && dueDate < startDate) return false
        if (endDate && dueDate > endDate) return false

        return true
      })
    }

    return filteredTasks
  } catch (error) {
    console.error("Error filtering tasks:", error)
    return []
  }
}

/**
 * 日付でタスクを取得
 */
export async function getTasksByDate(date: Date): Promise<SparkTask[]> {
  try {
    const tasks = await getTasks()
    return tasks.filter((task) => {
      if (!task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      return (
        dueDate.getFullYear() === date.getFullYear() &&
        dueDate.getMonth() === date.getMonth() &&
        dueDate.getDate() === date.getDate()
      )
    })
  } catch (error) {
    console.error("Error getting tasks by date:", error)
    return []
  }
}

/**
 * タスク統計情報を取得
 */
export async function getTaskStats(): Promise<{
  total: number
  completed: number
  partial: number
  incorrect: number
  pending: number
}> {
  try {
    const tasks = await getTasks()
    const total = tasks.length
    const completed = tasks.filter((task) => task.status === "complete").length
    const partial = tasks.filter((task) => task.status === "partial").length
    const incorrect = tasks.filter((task) => task.status === "incorrect").length
    const pending = total - completed - partial - incorrect

    return { total, completed, partial, incorrect, pending }
  } catch (error) {
    console.error("Error getting task stats:", error)
    return { total: 0, completed: 0, partial: 0, incorrect: 0, pending: 0 }
  }
}

export type { SparkTask } from "@/types/task"
