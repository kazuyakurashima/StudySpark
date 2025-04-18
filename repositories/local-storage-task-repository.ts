import type { TaskRepository } from "./task-repository"
import type { Task } from "@/types/models"
import { isSameDay } from "date-fns"

/**
 * ローカルストレージを使用したタスクリポジトリの実装
 */
export class LocalStorageTaskRepository implements TaskRepository {
  private readonly STORAGE_KEY = "calendar_tasks"

  /**
   * すべてのタスクを取得
   */
  async findAll(): Promise<Task[]> {
    try {
      const tasksJson = localStorage.getItem(this.STORAGE_KEY)
      if (!tasksJson) return []

      const tasks = JSON.parse(tasksJson, this.dateReviver)
      return tasks
    } catch (error) {
      console.error("Error getting tasks from localStorage:", error)
      return []
    }
  }

  /**
   * IDでタスクを取得
   */
  async findById(id: string): Promise<Task | null> {
    try {
      const tasks = await this.findAll()
      return tasks.find((task) => task.id === id) || null
    } catch (error) {
      console.error(`Error getting task ${id} from localStorage:`, error)
      return null
    }
  }

  /**
   * 新しいタスクを作成
   */
  async create(data: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
    try {
      const tasks = await this.findAll()

      const newTask: Task = {
        ...data,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedTasks = [...tasks, newTask]
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedTasks))

      return newTask
    } catch (error) {
      console.error("Error creating task in localStorage:", error)
      throw error
    }
  }

  /**
   * タスクを更新
   */
  async update(id: string, data: Partial<Task>): Promise<Task> {
    try {
      const tasks = await this.findAll()
      const taskIndex = tasks.findIndex((task) => task.id === id)

      if (taskIndex === -1) {
        throw new Error(`Task with id ${id} not found`)
      }

      const updatedTask = {
        ...tasks[taskIndex],
        ...data,
        updatedAt: new Date(),
      }

      tasks[taskIndex] = updatedTask
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks))

      return updatedTask
    } catch (error) {
      console.error(`Error updating task ${id} in localStorage:`, error)
      throw error
    }
  }

  /**
   * タスクを削除
   */
  async delete(id: string): Promise<void> {
    try {
      const tasks = await this.findAll()
      const filteredTasks = tasks.filter((task) => task.id !== id)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTasks))
    } catch (error) {
      console.error(`Error deleting task ${id} from localStorage:`, error)
      throw error
    }
  }

  /**
   * 日付でタスクをフィルタリング
   */
  async findByDate(date: Date): Promise<Task[]> {
    try {
      const tasks = await this.findAll()
      return tasks.filter((task) => {
        if (!task.dueDate) return false
        return isSameDay(new Date(task.dueDate), date)
      })
    } catch (error) {
      console.error("Error filtering tasks by date:", error)
      return []
    }
  }

  /**
   * 日付範囲でタスクをフィルタリング
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    try {
      const tasks = await this.findAll()
      return tasks.filter((task) => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        return dueDate >= startDate && dueDate <= endDate
      })
    } catch (error) {
      console.error("Error filtering tasks by date range:", error)
      return []
    }
  }

  /**
   * ステータスでタスクをフィルタリング
   */
  async findByStatus(status: Task["status"]): Promise<Task[]> {
    try {
      const tasks = await this.findAll()
      return tasks.filter((task) => task.status === status)
    } catch (error) {
      console.error("Error filtering tasks by status:", error)
      return []
    }
  }

  /**
   * 科目でタスクをフィルタリング
   */
  async findBySubject(subject: string): Promise<Task[]> {
    try {
      const tasks = await this.findAll()
      return tasks.filter((task) => task.subject === subject)
    } catch (error) {
      console.error("Error filtering tasks by subject:", error)
      return []
    }
  }

  /**
   * タグでタスクをフィルタリング
   */
  async findByTag(tag: string): Promise<Task[]> {
    try {
      const tasks = await this.findAll()
      return tasks.filter((task) => task.tags?.includes(tag))
    } catch (error) {
      console.error("Error filtering tasks by tag:", error)
      return []
    }
  }

  /**
   * タスクの統計情報を取得
   */
  async getStatistics(): Promise<{
    total: number
    completed: number
    partial: number
    incorrect: number
    pending: number
  }> {
    try {
      const tasks = await this.findAll()

      return {
        total: tasks.length,
        completed: tasks.filter((task) => task.status === "complete").length,
        partial: tasks.filter((task) => task.status === "partial").length,
        incorrect: tasks.filter((task) => task.status === "incorrect").length,
        pending: tasks.filter((task) => task.status === null).length,
      }
    } catch (error) {
      console.error("Error getting task statistics:", error)
      return { total: 0, completed: 0, partial: 0, incorrect: 0, pending: 0 }
    }
  }

  /**
   * ユニークIDを生成
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  /**
   * JSON.parseのリバイバー関数
   * 日付文字列をDateオブジェクトに変換
   */
  private dateReviver(key: string, value: any): any {
    if (key === "dueDate" || key === "originalDate" || key === "createdAt" || key === "updatedAt") {
      return value ? new Date(value) : null
    }
    return value
  }
}
