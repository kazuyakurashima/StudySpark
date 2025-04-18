// タスク関連の型定義
export type TaskStatus = "complete" | "partial" | "incorrect" | null

export interface SparkTask {
  id: string
  title: string
  subject: string
  status: TaskStatus
  dueDate: Date | null
  originalDate?: Date | null
  description?: string
  priority?: "high" | "medium" | "low"
  tags?: string[]
}

export interface TaskFilter {
  subject?: string
  status?: TaskStatus
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
}

export interface TaskStats {
  total: number
  completed: number
  partial: number
  incorrect: number
  pending: number
}
