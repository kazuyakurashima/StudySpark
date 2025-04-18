/**
 * タスクモデル
 */
export interface Task {
  id: string
  userId?: string
  title: string
  subject: string
  status: TaskStatus
  dueDate?: Date
  originalDate?: Date
  description?: string
  priority?: TaskPriority
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

/**
 * タスクのステータス
 */
export type TaskStatus = "complete" | "partial" | "incorrect" | null

/**
 * タスクの優先度
 */
export type TaskPriority = "high" | "medium" | "low"

/**
 * ユーザーモデル
 */
export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  grade?: number
  schoolType?: "elementary" | "junior_high" | "high_school"
  createdAt: Date
  updatedAt: Date
}

/**
 * 目標モデル
 */
export interface Goal {
  id: string
  userId: string
  title: string
  description?: string
  targetDate?: Date
  targetRank?: number
  totalStudents?: number
  createdAt: Date
  updatedAt: Date
  progress: number
  subject?: string
  bookId?: string
}

/**
 * タスクフィルター
 */
export interface TaskFilter {
  subject?: string
  status?: TaskStatus
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
}

/**
 * タスク統計情報
 */
export interface TaskStats {
  total: number
  completed: number
  partial: number
  incorrect: number
  pending: number
}
