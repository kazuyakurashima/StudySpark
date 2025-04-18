"use client"

import { useCallback } from "react"
import { useTaskContext } from "@/contexts/task-context"
import type { SparkTask, TaskStatus } from "@/types/task"

export function useTaskStatus() {
  const { updateTask } = useTaskContext()

  // タスクのステータスを更新
  const updateTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      await updateTask(taskId, { status })
    },
    [updateTask],
  )

  // タスクの完了状態をトグル
  const toggleTaskCompletion = useCallback(
    async (task: SparkTask) => {
      const newStatus: TaskStatus = task.status === "complete" ? null : "complete"
      await updateTask(task.id, { status: newStatus })
    },
    [updateTask],
  )

  // タスクの進捗状況を計算
  const calculateTaskProgress = useCallback((tasks: SparkTask[]): number => {
    if (tasks.length === 0) return 0

    const completedTasks = tasks.filter((task) => task.status === "complete").length
    return Math.round((completedTasks / tasks.length) * 100)
  }, [])

  return {
    updateTaskStatus,
    toggleTaskCompletion,
    calculateTaskProgress,
  }
}
