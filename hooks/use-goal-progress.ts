"use client"

import { useCallback } from "react"
import { useGoalContext } from "@/contexts/goal-context"
import { useTaskContext } from "@/contexts/task-context"
import type { Goal } from "@/types/goal"

export function useGoalProgress() {
  const { updateGoal } = useGoalContext()
  const { tasks } = useTaskContext()

  // 目標の進捗状況を計算
  const calculateGoalProgress = useCallback(
    (goalId: string): number => {
      // 目標に関連するタスクを取得
      const goalTasks = tasks.filter((task) => task.tags?.includes(goalId))

      if (goalTasks.length === 0) return 0

      const completedTasks = goalTasks.filter((task) => task.status === "complete").length
      return Math.round((completedTasks / goalTasks.length) * 100)
    },
    [tasks],
  )

  // 目標の進捗状況を更新
  const updateGoalProgress = useCallback(
    async (goal: Goal) => {
      const progress = calculateGoalProgress(goal.id)
      if (progress !== goal.progress) {
        await updateGoal(goal.id, { progress })
      }
    },
    [calculateGoalProgress, updateGoal],
  )

  return {
    calculateGoalProgress,
    updateGoalProgress,
  }
}
