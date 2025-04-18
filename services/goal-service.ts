import { defaultStorage } from "@/lib/storage-adapter"
import type { Goal, GoalReason, MathBook } from "@/types/goal"

const GOALS_STORAGE_KEY = "user_goals"
const GOAL_REASONS_STORAGE_KEY = "goal_reasons"
const MATH_BOOKS_STORAGE_KEY = "math_books"

// 目標取得
export async function getGoals(): Promise<Goal[]> {
  try {
    const goals = await defaultStorage.getItem<Goal[]>(GOALS_STORAGE_KEY)
    return goals || []
  } catch (error) {
    console.error("Error getting goals:", error)
    return []
  }
}

// 目標追加
export async function addGoal(goal: Goal): Promise<Goal> {
  try {
    const goals = await getGoals()
    const newGoals = [...goals, goal]
    await defaultStorage.setItem(GOALS_STORAGE_KEY, newGoals)
    return goal
  } catch (error) {
    console.error("Error adding goal:", error)
    throw error
  }
}

// 目標更新
export async function updateGoal(updatedGoal: Goal): Promise<Goal> {
  try {
    const goals = await getGoals()
    const goalIndex = goals.findIndex((goal) => goal.id === updatedGoal.id)

    if (goalIndex === -1) {
      throw new Error(`Goal with id ${updatedGoal.id} not found`)
    }

    const newGoals = [...goals]
    newGoals[goalIndex] = updatedGoal
    await defaultStorage.setItem(GOALS_STORAGE_KEY, newGoals)
    return updatedGoal
  } catch (error) {
    console.error("Error updating goal:", error)
    throw error
  }
}

// 目標削除
export async function deleteGoal(goalId: string): Promise<void> {
  try {
    const goals = await getGoals()
    const newGoals = goals.filter((goal) => goal.id !== goalId)
    await defaultStorage.setItem(GOALS_STORAGE_KEY, newGoals)

    // 関連する理由も削除
    await deleteGoalReason(goalId)
  } catch (error) {
    console.error("Error deleting goal:", error)
    throw error
  }
}

// 目標理由取得
export async function getGoalReason(goalId: string): Promise<GoalReason | null> {
  try {
    const reasons = await defaultStorage.getItem<GoalReason[]>(GOAL_REASONS_STORAGE_KEY)
    if (!reasons) return null

    return reasons.find((reason) => reason.goalId === goalId) || null
  } catch (error) {
    console.error("Error getting goal reason:", error)
    return null
  }
}

// 目標理由追加/更新
export async function saveGoalReason(goalReason: GoalReason): Promise<GoalReason> {
  try {
    const reasons = (await defaultStorage.getItem<GoalReason[]>(GOAL_REASONS_STORAGE_KEY)) || []
    const reasonIndex = reasons.findIndex((reason) => reason.goalId === goalReason.goalId)

    if (reasonIndex === -1) {
      // 新規追加
      const newReasons = [...reasons, goalReason]
      await defaultStorage.setItem(GOAL_REASONS_STORAGE_KEY, newReasons)
    } else {
      // 更新
      const newReasons = [...reasons]
      newReasons[reasonIndex] = goalReason
      await defaultStorage.setItem(GOAL_REASONS_STORAGE_KEY, newReasons)
    }

    return goalReason
  } catch (error) {
    console.error("Error saving goal reason:", error)
    throw error
  }
}

// 目標理由削除
export async function deleteGoalReason(goalId: string): Promise<void> {
  try {
    const reasons = await defaultStorage.getItem<GoalReason[]>(GOAL_REASONS_STORAGE_KEY)
    if (!reasons) return

    const newReasons = reasons.filter((reason) => reason.goalId !== goalId)
    await defaultStorage.setItem(GOAL_REASONS_STORAGE_KEY, newReasons)
  } catch (error) {
    console.error("Error deleting goal reason:", error)
    throw error
  }
}

// 数学の本一覧取得
export async function getMathBooks(): Promise<MathBook[]> {
  try {
    const books = await defaultStorage.getItem<MathBook[]>(MATH_BOOKS_STORAGE_KEY)
    return books || []
  } catch (error) {
    console.error("Error getting math books:", error)
    return []
  }
}

// 数学の本取得
export async function getMathBook(bookId: string): Promise<MathBook | null> {
  try {
    const books = await getMathBooks()
    return books.find((book) => book.id === bookId) || null
  } catch (error) {
    console.error("Error getting math book:", error)
    return null
  }
}
