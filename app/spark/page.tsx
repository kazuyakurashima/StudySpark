"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { TaskList } from "@/components/spark/task-list"
import { StudyPlanCreator } from "@/components/spark/study-plan-creator"
import { useSearchParams } from "next/navigation"
import { mathProblems } from "@/data/math-problems"

export default function TasksPage() {
  const [plannedTasks, setPlannedTasks] = useState([])
  const [showPlanCreator, setShowPlanCreator] = useState(false)
  const [hasPlan, setHasPlan] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // URLパラメータからshowPlanCreatorを取得
    const showPlanCreatorParam = searchParams.get("showPlanCreator")
    if (showPlanCreatorParam === "true") {
      setShowPlanCreator(true)
    }

    // 学習計画の有無を確認
    const hasStudyPlan = localStorage.getItem("has_study_plan") === "true"
    setHasPlan(hasStudyPlan)
  }, [searchParams])

  const handlePlanCreated = (tasks) => {
    setPlannedTasks(tasks)
    setHasPlan(true)
    localStorage.setItem("has_study_plan", "true")

    // 学習計画作成後、評価ガイドを表示するためのフラグをリセット
    localStorage.removeItem("has_seen_evaluation_guide")

    // 学習計画作成画面を非表示
    setShowPlanCreator(false)
  }

  const handleCreatePlan = () => {
    setShowPlanCreator(true)
  }

  return (
    <main className="flex min-h-screen flex-col pb-20">
      <Header title="スパークリスト" />
      {showPlanCreator && (
        <StudyPlanCreator onPlanCreated={handlePlanCreated} hasPlan={hasPlan} problemData={mathProblems} />
      )}
      <TaskList plannedTasks={plannedTasks} onCreatePlan={handleCreatePlan} />
      <BottomNavigation />
    </main>
  )
}
