// 目標関連の型定義
export interface Goal {
  id: string
  title: string
  description?: string
  targetDate: Date | null
  createdAt: Date
  updatedAt: Date
  progress: number // 0-100
  subject?: string
  bookId?: string
  chapterRange?: {
    start: number
    end: number
  }
}

export interface GoalReason {
  goalId: string
  reason: string
  createdAt: Date
  updatedAt: Date
}

export interface MathBook {
  id: string
  title: string
  author?: string
  description?: string
  chapters: MathBookChapter[]
}

export interface MathBookChapter {
  id: string
  title: string
  sections: MathBookSection[]
}

export interface MathBookSection {
  id: string
  title: string
  problems: number
}
