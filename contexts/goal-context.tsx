"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Goal, GoalReason, MathBook } from "@/types/goal"
import * as GoalService from "@/services/goal-service"

interface GoalContextType {
  goals: Goal[]
  currentGoal: Goal | null
  isLoading: boolean
  error: Error | null
  fetchGoals: () => Promise<void>
  getGoal: (goalId: string) => Goal | null
  addGoal: (goal: Goal) => Promise<void>
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (goalId: string) => Promise<void>
  getGoalReason: (goalId: string) => Promise<GoalReason | null>
  saveGoalReason: (goalReason: GoalReason) => Promise<void>
  getMathBooks: () => Promise<MathBook[]>
  getMathBook: (bookId: string) => Promise<MathBook | null>
  setCurrentGoal: (goal: Goal | null) => void
}

const GoalContext = createContext<GoalContextType | undefined>(undefined)

export function GoalProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // 目標一覧を取得
  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true)
      const fetchedGoals = await GoalService.getGoals()
      setGoals(fetchedGoals)

      // 現在の目標がない場合は最初の目標を設定
      if (!currentGoal && fetchedGoals.length > 0) {
        setCurrentGoal(fetchedGoals[0])
      }

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("目標の取得に失敗しました"))
      console.error("Failed to fetch goals:", err)
    } finally {
      setIsLoading(false)
    }
  }, [currentGoal])

  // 初期化時に目標を読み込む
  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  // 目標を取得
  const getGoal = useCallback(
    (goalId: string): Goal | null => {
      return goals.find((goal) => goal.id === goalId) || null
    },
    [goals],
  )

  // 目標を追加
  const addGoal = useCallback(
    async (goal: Goal) => {
      try {
        setIsLoading(true)
        await GoalService.addGoal(goal)
        await fetchGoals() // 最新の目標一覧を再取得

        // 新しく追加した目標を現在の目標に設定
        setCurrentGoal(goal)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("目標の追加に失敗しました"))
        console.error("Failed to add goal:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [fetchGoals],
  )

  // 目標を更新
  const updateGoal = useCallback(
    async (goalId: string, updates: Partial<Goal>) => {
      try {
        setIsLoading(true)
        const goalToUpdate = goals.find((goal) => goal.id === goalId)

        if (!goalToUpdate) {
          throw new Error(`Goal with id ${goalId} not found`)
        }

        const updatedGoal = { ...goalToUpdate, ...updates, updatedAt: new Date() }
        await GoalService.updateGoal(updatedGoal as Goal)
        await fetchGoals() // 最新の目標一覧を再取得

        // 更新した目標が現在の目標の場合、現在の目標も更新
        if (currentGoal && currentGoal.id === goalId) {
          setCurrentGoal(updatedGoal as Goal)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("目標の更新に失敗しました"))
        console.error("Failed to update goal:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [goals, currentGoal, fetchGoals],
  )

  // 目標を削除
  const deleteGoal = useCallback(
    async (goalId: string) => {
      try {
        setIsLoading(true)
        await GoalService.deleteGoal(goalId)
        await fetchGoals() // 最新の目標一覧を再取得

        // 削除した目標が現在の目標の場合、現在の目標をリセット
        if (currentGoal && currentGoal.id === goalId) {
          const remainingGoals = goals.filter((goal) => goal.id !== goalId)
          setCurrentGoal(remainingGoals.length > 0 ? remainingGoals[0] : null)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("目標の削除に失敗しました"))
        console.error("Failed to delete goal:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [goals, currentGoal, fetchGoals],
  )

  // 目標理由を取得
  const getGoalReasonImpl = useCallback(async (goalId: string): Promise<GoalReason | null> => {
    try {
      return await GoalService.getGoalReason(goalId)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("目標理由の取得に失敗しました"))
      console.error("Failed to get goal reason:", err)
      return null
    }
  }, [])

  // 目標理由を保存
  const saveGoalReasonImpl = useCallback(async (goalReason: GoalReason) => {
    try {
      setIsLoading(true)
      await GoalService.saveGoalReason(goalReason)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("目標理由の保存に失敗しました"))
      console.error("Failed to save goal reason:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 数学の本一覧を取得
  const getMathBooksImpl = useCallback(async (): Promise<MathBook[]> => {
    try {
      return await GoalService.getMathBooks()
    } catch (err) {
      setError(err instanceof Error ? err : new Error("数学の本一覧の取得に失敗しました"))
      console.error("Failed to get math books:", err)
      return []
    }
  }, [])

  // 数学の本を取得
  const getMathBookImpl = useCallback(async (bookId: string): Promise<MathBook | null> => {
    try {
      return await GoalService.getMathBook(bookId)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("数学の本の取得に失敗しました"))
      console.error("Failed to get math book:", err)
      return null
    }
  }, [])

  return (
    <GoalContext.Provider
      value={{
        goals,
        currentGoal,
        isLoading,
        error,
        fetchGoals,
        getGoal,
        addGoal,
        updateGoal,
        deleteGoal,
        getGoalReason: getGoalReasonImpl,
        saveGoalReason: saveGoalReasonImpl,
        getMathBooks: getMathBooksImpl,
        getMathBook: getMathBookImpl,
        setCurrentGoal,
      }}
    >
      {children}
    </GoalContext.Provider>
  )
}

export function useGoalContext() {
  const context = useContext(GoalContext)
  if (context === undefined) {
    throw new Error("useGoalContext must be used within a GoalProvider")
  }
  return context
}
