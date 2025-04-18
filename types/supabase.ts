/**
 * Supabaseのテーブル定義に対応する型
 */

// ユーザーテーブル
export interface DbUser {
  id: string
  email: string
  name: string
  avatar_url: string | null
  grade: number | null
  school_type: "elementary" | "junior_high" | "high_school" | null
  created_at: string
  updated_at: string
}

// 目標テーブル
export interface DbGoal {
  id: string
  user_id: string
  title: string
  description: string | null
  target_date: string | null
  target_rank: number | null
  total_students: number | null
  created_at: string
  updated_at: string
  progress: number
  subject: string | null
  book_id: string | null
}

// 目標理由テーブル
export interface DbGoalReason {
  id: string
  goal_id: string
  reason: string
  created_at: string
  updated_at: string
}

// 問題集テーブル
export interface DbMathBook {
  id: string
  title: string
  author: string | null
  description: string | null
  created_at: string
  updated_at: string
}

// 問題集の章テーブル
export interface DbMathBookChapter {
  id: string
  book_id: string
  title: string
  order_index: number
  created_at: string
  updated_at: string
}

// 問題集の節テーブル
export interface DbMathBookSection {
  id: string
  chapter_id: string
  title: string
  order_index: number
  problems_count: number
  created_at: string
  updated_at: string
}

// タスクテーブル
export interface DbTask {
  id: string
  user_id: string
  title: string
  subject: string
  status: "complete" | "partial" | "incorrect" | null
  due_date: string | null
  original_date: string | null
  description: string | null
  priority: "high" | "medium" | "low" | null
  created_at: string
  updated_at: string
}

// タスクタグテーブル
export interface DbTaskTag {
  id: string
  task_id: string
  tag: string
  created_at: string
}

// ユーザー設定テーブル
export interface DbUserPreference {
  id: string
  user_id: string
  theme: "light" | "dark" | "system"
  notifications: boolean
  study_reminders: boolean
  reminder_time: string | null
  weekly_goal: number | null
  created_at: string
  updated_at: string
}

// コーチテーブル
export interface DbCoach {
  id: string
  name: string
  avatar_url: string
  specialty: string
  description: string
  created_at: string
  updated_at: string
}

// ユーザーコーチ関連テーブル
export interface DbUserCoach {
  id: string
  user_id: string
  coach_id: string
  created_at: string
  updated_at: string
}
