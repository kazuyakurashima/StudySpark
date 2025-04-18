// ユーザー関連の型定義
export interface UserProfile {
  id: string
  name: string
  email?: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
  preferences?: UserPreferences
  onboardingCompleted: boolean
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  notifications: boolean
  studyReminders: boolean
  reminderTime?: string // HH:MM format
  weeklyGoal?: number // hours per week
}

export interface Coach {
  id: string
  name: string
  avatarUrl: string
  specialty: string
  description: string
}
