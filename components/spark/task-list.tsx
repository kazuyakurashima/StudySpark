"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Circle, Filter, Calendar } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { TaskEvaluationGuide } from "./task-evaluation-guide"
import { cn } from "@/lib/utils"

// 問題の進捗状況を計算
const getChapterProgress = (problems) => {
  if (!Array.isArray(problems)) return { completed: 0, total: 0, percentage: 0 }
  const total = problems.length
  const completed = problems.filter((p) => p?.status === "complete").length
  return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
}

// デフォルトのタスクデータ
const defaultTaskData = [
  {
    id: 1,
    chapter: "第1章 正の数と負の数",
    section: "③ 乗法と除法",
    color: "blue",
    problems: Array.from({ length: 15 }, (_, i) => ({
      id: i + 30,
      status: null,
      lastUpdated: null,
    })),
  },
  {
    id: 2,
    chapter: "第1章 正の数と負の数",
    section: "④ 四則の混じった計算",
    color: "green",
    problems: Array.from({ length: 6 }, (_, i) => ({
      id: i + 45,
      status: null,
      lastUpdated: null,
    })),
  },
]

export function TaskList({ plannedTasks = [], onCreatePlan }) {
  const [taskData, setTaskData] = useState([])
  const [filter, setFilter] = useState("all")
  const [showAnimation, setShowAnimation] = useState(true)
  const [currentAnimation, setCurrentAnimation] = useState(null)
  const [showEvaluationGuide, setShowEvaluationGuide] = useState(false)
  const [viewMode, setViewMode] = useState("problem") // 表示モード（chapter, section, problem）
  const [hasStudyPlan, setHasStudyPlan] = useState(false)
  const router = useRouter()

  // アニメーション再生関数を先に定義
  const playCompletionAnimation = useCallback(() => {
    try {
      // アニメーションの種類をランダムに選択
      const animations = ["fireworks", "confetti", "stars"]
      const randomAnimation = animations[Math.floor(Math.random() * animations.length)]

      // 現在のアニメーションをセット
      setCurrentAnimation(randomAnimation)

      // アニメーション終了後にnullに戻す
      setTimeout(() => {
        setCurrentAnimation(null)
      }, 2000)
    } catch (err) {
      console.error("Error playing animation:", err)
    }
  }, [])

  // スパークタスクデータを読み込む
  useEffect(() => {
    try {
      // 学習計画の有無を確認
      const hasPlan = localStorage.getItem("has_study_plan") === "true"
      setHasStudyPlan(hasPlan)

      // ローカルストレージからデータを取得
      const sparkTaskData = localStorage.getItem("spark_task_data")
      if (sparkTaskData) {
        try {
          const parsedData = JSON.parse(sparkTaskData)
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            setTaskData(parsedData)
          } else {
            // 配列でない場合はデフォルトデータを設定
            setTaskData(defaultTaskData)
          }
        } catch (e) {
          console.error("Failed to parse spark task data:", e)
          setTaskData(defaultTaskData)
        }
      } else {
        // データがない場合はデフォルトデータを設定
        setTaskData(defaultTaskData)
      }

      // 評価ガイドを表示するかどうかを判定
      const hasSeenGuide = localStorage.getItem("has_seen_evaluation_guide") === "true"
      if (!hasSeenGuide && hasPlan) {
        setShowEvaluationGuide(true)
      }
    } catch (err) {
      console.error("Failed to load task data:", err)
      // エラー時はデフォルトデータを設定
      setTaskData(defaultTaskData)
    }
  }, [plannedTasks])

  // 評価ガイドを閉じる
  const handleCloseGuide = useCallback(() => {
    setShowEvaluationGuide(false)
    localStorage.setItem("has_seen_evaluation_guide", "true")
  }, [])

  // ステータス変更処理
  const handleStatusChange = useCallback(
    (chapterId, problemId, status) => {
      try {
        // 現在の問題のステータスを取得
        const currentChapter = taskData.find((chapter) => chapter?.id === chapterId)
        const currentProblem = currentChapter?.problems?.find((problem) => problem?.id === problemId)
        const currentStatus = currentProblem?.status

        // 新しいステータスを決定（同じステータスをクリックした場合はnullに戻す）
        const newStatus = currentStatus === status ? null : status

        // アニメーション表示の条件を修正
        // 完答ボタンをクリックし、かつ現在のステータスが完答でない場合にアニメーションを表示
        if (status === "complete" && currentStatus !== "complete" && showAnimation) {
          playCompletionAnimation()
        }

        setTaskData((prevData) => {
          // 安全にデータをコピー
          if (!Array.isArray(prevData)) {
            console.error("taskData is not an array:", prevData)
            return defaultTaskData
          }

          const newData = [...prevData]
          const chapterIndex = newData.findIndex((chapter) => chapter?.id === chapterId)

          if (chapterIndex === -1) return prevData

          const chapter = newData[chapterIndex]
          if (!chapter || !Array.isArray(chapter.problems)) return prevData

          const problemIndex = chapter.problems.findIndex((problem) => problem?.id === problemId)
          if (problemIndex === -1) return prevData

          const problem = chapter.problems[problemIndex]
          if (!problem) return prevData

          // 問題を更新
          const updatedProblem = {
            ...problem,
            status: newStatus,
            lastUpdated: newStatus ? new Date().toISOString() : null,
          }

          // 章の問題配列を更新
          const updatedProblems = [...chapter.problems]
          updatedProblems[problemIndex] = updatedProblem

          // 章を更新
          const updatedChapter = {
            ...chapter,
            problems: updatedProblems,
          }

          // 全体のデータを更新
          newData[chapterIndex] = updatedChapter

          // ローカルストレージに保存
          try {
            localStorage.setItem("spark_task_data", JSON.stringify(newData))
            // カレンダーに通知
            window.dispatchEvent(new CustomEvent("spark-tasks-updated"))
          } catch (err) {
            console.error("Failed to save task data:", err)
          }

          return newData
        })
      } catch (err) {
        console.error("Error updating task status:", err)
      }
    },
    [taskData, showAnimation, playCompletionAnimation],
  )

  // フィルタリング関数
  const getFilteredProblems = useCallback(
    (problems) => {
      if (!Array.isArray(problems)) return []
      if (filter === "all") return problems
      if (filter === "null") return problems.filter((problem) => problem?.status === null)
      return problems.filter((problem) => problem?.status === filter)
    },
    [filter],
  )

  // 章ごとの背景色を取得
  const getChapterColor = useCallback((color) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 border-blue-200"
      case "green":
        return "bg-green-50 border-green-200"
      case "purple":
        return "bg-purple-50 border-purple-200"
      case "orange":
        return "bg-orange-50 border-orange-200"
      case "red":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }, [])

  // 章ごとのアクセントカラーを取得
  const getChapterAccentColor = useCallback((color) => {
    switch (color) {
      case "blue":
        return "bg-blue-500 text-white"
      case "green":
        return "bg-green-500 text-white"
      case "purple":
        return "bg-purple-500 text-white"
      case "orange":
        return "bg-orange-500 text-white"
      case "red":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }, [])

  // 章・項目・問題の表示を切り替える処理
  const renderContent = useCallback(() => {
    // taskDataが配列でない場合は空の配列を使用
    const safeTaskData = Array.isArray(taskData) ? taskData : []

    if (viewMode === "chapter") {
      // 章ごとの表示
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {safeTaskData.map((chapter) => {
            if (!chapter) return null
            const progress = getChapterProgress(chapter.problems || [])
            return (
              <Card key={chapter.id} className={`${getChapterColor(chapter.color || "")} border`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{chapter.chapter}</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {progress.completed}/{progress.total} 完了
                    </span>
                    <span className="text-sm font-medium">{progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )
    } else if (viewMode === "section") {
      // 項目ごとの表示
      return (
        <div className="space-y-4">
          {safeTaskData.map((chapter) => {
            if (!chapter) return null
            return (
              <div key={chapter.id} className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
                <h3 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">{chapter.chapter}</h3>
                <div className="space-y-2">
                  <div className={`p-2 sm:p-3 rounded-lg ${getChapterColor(chapter.color || "")}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm sm:text-base">{chapter.section}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )
    } else {
      // 問題ごとの表示（デフォルト）
      return (
        <div className="space-y-4">
          {safeTaskData.map((chapter) => {
            if (!chapter) return null
            const progress = getChapterProgress(chapter.problems || [])
            return (
              <Accordion
                key={chapter.id}
                type="single"
                collapsible
                className="w-full border rounded-md overflow-hidden"
                defaultValue={`chapter-${chapter.id}`} // デフォルトで開いた状態にする
              >
                <AccordionItem
                  value={`chapter-${chapter.id}`}
                  className={`border-none ${getChapterColor(chapter.color || "")}`}
                >
                  <AccordionTrigger className="px-2 sm:px-4 py-2 sm:py-3 hover:bg-opacity-70">
                    <div className="text-left flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <p className="font-medium text-sm sm:text-base">{chapter.chapter}</p>
                        <div className="mt-1 sm:mt-0 sm:ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold">
                          {progress.completed}/{progress.total}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">{chapter.section}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pb-0">
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {getFilteredProblems(chapter.problems || []).map((problem) => {
                        if (!problem) return null
                        return (
                          <div
                            key={problem.id}
                            className={cn(
                              "border rounded-md p-2 sm:p-3 bg-white hover:shadow-md transition-all cursor-pointer",
                              problem.status === "complete"
                                ? "task-complete-gradient"
                                : problem.status === "partial"
                                  ? "task-partial-gradient"
                                  : problem.status === "incorrect"
                                    ? "task-incorrect-gradient"
                                    : "hover:bg-gray-50",
                            )}
                          >
                            <div className="flex flex-col items-center">
                              <div className="text-center font-medium mb-2 text-sm sm:text-base">問題 {problem.id}</div>
                              <div className="flex space-x-1 sm:space-x-2">
                                <button
                                  className={`task-button ${problem.status === "complete" ? "complete" : "complete-outline"}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusChange(chapter.id, problem.id, "complete")
                                  }}
                                  aria-label="完答"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  className={`task-button ${problem.status === "partial" ? "partial" : "partial-outline"}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusChange(chapter.id, problem.id, "partial")
                                  }}
                                  aria-label="一部正解"
                                >
                                  <AlertCircle className="h-4 w-4" />
                                </button>
                                <button
                                  className={`task-button ${problem.status === "incorrect" ? "incorrect" : "incorrect-outline"}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusChange(chapter.id, problem.id, "incorrect")
                                  }}
                                  aria-label="誤答"
                                >
                                  <Circle className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )
          })}
        </div>
      )
    }
  }, [taskData, viewMode, filter, getChapterProgress, getChapterColor, getFilteredProblems, handleStatusChange])

  // モックデータ生成処理
  const handleGenerateMockData = () => {
    try {
      // モックデータを生成
      const mockData = [
        {
          id: 1,
          chapter: "第1章 正の数と負の数",
          section: "③ 乗法と除法",
          color: "blue",
          problems: Array.from({ length: 15 }, (_, i) => ({
            id: i + 30,
            status:
              Math.random() > 0.7
                ? Math.random() > 0.5
                  ? "complete"
                  : Math.random() > 0.5
                    ? "partial"
                    : "incorrect"
                : null,
            lastUpdated: new Date().toISOString(),
          })),
        },
        {
          id: 2,
          chapter: "第1章 正の数と負の数",
          section: "④ 四則の混じった計算",
          color: "green",
          problems: Array.from({ length: 6 }, (_, i) => ({
            id: i + 45,
            status:
              Math.random() > 0.7
                ? Math.random() > 0.5
                  ? "complete"
                  : Math.random() > 0.5
                    ? "partial"
                    : "incorrect"
                : null,
            lastUpdated: new Date().toISOString(),
          })),
        },
        {
          id: 3,
          chapter: "第2章 式の計算",
          section: "① 文字式",
          color: "purple",
          problems: Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            status:
              Math.random() > 0.7
                ? Math.random() > 0.5
                  ? "complete"
                  : Math.random() > 0.5
                    ? "partial"
                    : "incorrect"
                : null,
            lastUpdated: new Date().toISOString(),
          })),
        },
      ]

      // ローカルストレージに保存
      localStorage.setItem("spark_task_data", JSON.stringify(mockData))

      // 状態を更新
      setTaskData(mockData)

      // カレンダーに通知
      window.dispatchEvent(new CustomEvent("spark-tasks-updated"))
    } catch (err) {
      console.error("Error generating mock data:", err)
    }
  }

  return (
    <div className="p-4">
      {/* 学習計画作成ボタン - 計画がない場合のみ表示 */}
      {!hasStudyPlan && (
        <Card className="mb-4 shadow-sm border-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-500" />
              学習計画を立てる
            </CardTitle>
            <CardDescription>テスト範囲に合わせた学習計画を立てましょう</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button className="w-full goal-button py-4 text-base hover-effect" onClick={onCreatePlan}>
              <Calendar className="mr-2 h-5 w-5" />
              学習計画を立てる
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg mb-4 border border-yellow-200">
        <h3 className="font-medium mb-2 text-sm sm:text-base">テスト用モックデータ</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3">
          カウントダウン機能のテスト用にモックデータを生成します。
          これにより、スパークリストとカレンダーの連携を確認できます。
        </p>
        <Button
          onClick={handleGenerateMockData}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm sm:text-base"
        >
          モックデータを生成
        </Button>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle className="text-lg mb-2 sm:mb-0">スパークリスト</CardTitle>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-xs px-2 py-1 h-auto ${viewMode === "chapter" ? "bg-white shadow-sm" : ""}`}
                  onClick={() => setViewMode("chapter")}
                >
                  章
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-xs px-2 py-1 h-auto ${viewMode === "section" ? "bg-white shadow-sm" : ""}`}
                  onClick={() => setViewMode("section")}
                >
                  項目
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-xs px-2 py-1 h-auto ${viewMode === "problem" ? "bg-white shadow-sm" : ""}`}
                  onClick={() => setViewMode("problem")}
                >
                  問題
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="animation-toggle" className="text-xs">
                  アニメ
                </Label>
                <Switch id="animation-toggle" checked={showAnimation} onCheckedChange={setShowAnimation} />
              </div>
            </div>
          </div>
          <CardDescription className="mt-2">問題の取り組み状況を記録しましょう</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center">
            <Select value={filter} onValueChange={(value) => setFilter(value)}>
              <SelectTrigger className="w-full sm:w-64">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="フィルター" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて表示</SelectItem>
                <SelectItem value="complete">完答のみ</SelectItem>
                <SelectItem value="partial">一部正解のみ</SelectItem>
                <SelectItem value="incorrect">誤答のみ</SelectItem>
                <SelectItem value="null">未着手のみ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderContent()}
        </CardContent>
      </Card>

      {/* アニメーション表示部分 */}
      {currentAnimation && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          {currentAnimation === "fireworks" && (
            <div className="animation-container">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="firework"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 1.5}s`,
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                  }}
                />
              ))}
            </div>
          )}

          {currentAnimation === "confetti" && (
            <div className="animation-container">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className="confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`,
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${Math.random() * 3 + 2}s`,
                  }}
                />
              ))}
            </div>
          )}

          {currentAnimation === "stars" && (
            <div className="animation-container">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="star"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                    fontSize: `${Math.random() * 20 + 10}px`,
                  }}
                >
                  ★
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 評価方法ガイダンスモーダル */}
      {showEvaluationGuide && <TaskEvaluationGuide onClose={handleCloseGuide} />}
    </div>
  )
}
