"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Circle, AlertCircle, Filter } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// モックタスクデータ
const tasks = [
  {
    id: 1,
    chapter: "第1章 正の数と負の数",
    section: "③ 乗法と除法",
    problems: [
      { id: 30, status: null, lastUpdated: null },
      { id: 31, status: null, lastUpdated: null },
      { id: 32, status: null, lastUpdated: null },
      { id: 33, status: null, lastUpdated: null },
      { id: 34, status: null, lastUpdated: null },
      { id: 35, status: null, lastUpdated: null },
      { id: 36, status: null, lastUpdated: null },
      { id: 37, status: null, lastUpdated: null },
      { id: 38, status: null, lastUpdated: null },
      { id: 39, status: null, lastUpdated: null },
      { id: 40, status: null, lastUpdated: null },
      { id: 41, status: null, lastUpdated: null },
      { id: 42, status: null, lastUpdated: null },
      { id: 43, status: null, lastUpdated: null },
      { id: 44, status: null, lastUpdated: null },
    ],
  },
  {
    id: 2,
    chapter: "第1章 正の数と負の数",
    section: "④ 四則の混じった計算",
    problems: [
      { id: 45, status: null, lastUpdated: null },
      { id: 46, status: null, lastUpdated: null },
      { id: 47, status: null, lastUpdated: null },
      { id: 48, status: null, lastUpdated: null },
      { id: 49, status: null, lastUpdated: null },
      { id: 50, status: null, lastUpdated: null },
    ],
  },
]

type TaskStatus = "complete" | "partial" | "incorrect" | null

export function TaskList() {
  const [taskData, setTaskData] = useState(tasks)
  const [filter, setFilter] = useState<TaskStatus | "all">("all")
  const [showAnimation, setShowAnimation] = useState(true)
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null)
  const router = useRouter()

  const handleStatusChange = (chapterId: number, problemId: number, status: TaskStatus) => {
    setTaskData((prevData) => {
      const newData = [...prevData]
      const chapterIndex = newData.findIndex((chapter) => chapter.id === chapterId)

      if (chapterIndex !== -1) {
        const problemIndex = newData[chapterIndex].problems.findIndex((problem) => problem.id === problemId)

        if (problemIndex !== -1) {
          // 同じステータスをクリックした場合はnullに戻す
          const newStatus = newData[chapterIndex].problems[problemIndex].status === status ? null : status

          newData[chapterIndex].problems[problemIndex] = {
            ...newData[chapterIndex].problems[problemIndex],
            status: newStatus,
            lastUpdated: newStatus ? new Date() : null,
          }
        }
      }

      return newData
    })

    // ステータス変更処理の部分を修正します
    // 以下のコードを:

    // 完答をクリックした場合かつアニメーションが有効な場合
    // if (status === "complete" && showAnimation) {
    //   playCompletionAnimation()
    // }

    // 以下のように変更します:

    // 現在の問題のステータスを取得
    const currentChapter = taskData.find((chapter) => chapter.id === chapterId)
    const currentProblem = currentChapter?.problems.find((problem) => problem.id === problemId)
    const currentStatus = currentProblem?.status

    // 完答ボタンをクリックし、かつ現在のステータスが完答でない場合にアニメーションを表示
    if (status === "complete" && currentStatus !== "complete" && showAnimation) {
      playCompletionAnimation()
    }
  }

  const playCompletionAnimation = () => {
    // アニメーションの種類をランダムに選択
    const animations = ["fireworks", "confetti", "stars"]
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)]

    // 現在のアニメーションをセット
    setCurrentAnimation(randomAnimation)

    // アニメーション終了後にnullに戻す
    setTimeout(() => {
      setCurrentAnimation(null)
    }, 2000)
  }

  const getFilteredProblems = (problems: any[]) => {
    if (filter === "all") return problems
    return problems.filter((problem) => problem.status === filter)
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case "partial":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "incorrect":
        return <Circle className="h-5 w-5 text-red-500" />
      default:
        return <Circle className="h-5 w-5 text-gray-300" />
    }
  }

  // アニメーションのクリーンアップ
  useEffect(() => {
    return () => {
      if (currentAnimation) {
        setCurrentAnimation(null)
      }
    }
  }, [currentAnimation])

  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">スパークリスト</CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor="animation-toggle" className="text-xs">
                アニメ
              </Label>
              <Switch id="animation-toggle" checked={showAnimation} onCheckedChange={setShowAnimation} />
            </div>
          </div>
          <CardDescription>問題の取り組み状況を記録しましょう</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-full">
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
                <SelectItem value={null}>未記録のみ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {taskData.map((chapter) => (
              <Accordion key={chapter.id} type="single" collapsible className="w-full border rounded-md">
                <AccordionItem value={`chapter-${chapter.id}`} className="border-none">
                  <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                    <div className="text-left">
                      <p className="font-medium">{chapter.chapter}</p>
                      <p className="text-sm text-gray-500">{chapter.section}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-2">
                    <div className="space-y-2">
                      {getFilteredProblems(chapter.problems).map((problem) => (
                        <div key={problem.id} className="border rounded-md p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">問題 {problem.id}</p>
                              {problem.lastUpdated && (
                                <p className="text-xs text-gray-500">
                                  最終更新: {problem.lastUpdated.toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="task-buttons">
                              <button
                                className={`task-button ${problem.status === "complete" ? "complete" : ""}`}
                                onClick={() => handleStatusChange(chapter.id, problem.id, "complete")}
                                aria-label="完答"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                className={`task-button ${problem.status === "partial" ? "partial" : ""}`}
                                onClick={() => handleStatusChange(chapter.id, problem.id, "partial")}
                                aria-label="一部正解"
                              >
                                <AlertCircle className="h-4 w-4" />
                              </button>
                              <button
                                className={`task-button ${problem.status === "incorrect" ? "incorrect" : ""}`}
                                onClick={() => handleStatusChange(chapter.id, problem.id, "incorrect")}
                                aria-label="誤答"
                              >
                                <Circle className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
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
    </div>
  )
}
