"use client"
import { Button } from "@/components/ui/button"
import { addDays } from "date-fns"
import { toast } from "@/components/ui/use-toast"

export function GenerateMockData() {
  // モックデータを生成して保存する関数
  const generateMockData = () => {
    try {
      // スパークタスクデータを生成
      const sparkTaskData = [
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

      // カレンダータスクデータを生成
      const today = new Date()
      const calendarTasks = []

      // 今日から2週間分のタスクを生成
      for (let i = 0; i < 14; i++) {
        const taskDate = addDays(today, i)

        // 各章から1-3問をランダムに選択
        sparkTaskData.forEach((chapter) => {
          if (Math.random() > 0.3) {
            // 70%の確率でその日にタスクを追加
            const problemCount = Math.floor(Math.random() * 3) + 1 // 1-3問

            for (let j = 0; j < problemCount; j++) {
              if (chapter.problems && chapter.problems.length > 0) {
                const randomProblemIndex = Math.floor(Math.random() * chapter.problems.length)
                const problem = chapter.problems[randomProblemIndex]

                if (problem) {
                  calendarTasks.push({
                    id: `spark-${chapter.id}-${problem.id}`,
                    title: `${chapter.chapter} - ${chapter.section} - 問題${problem.id}`,
                    subject: "数学",
                    status: null, // 初期状態は未着手
                    dueDate: new Date(taskDate),
                    originalDate: null,
                  })
                }
              }
            }
          }
        })
      }

      // ローカルストレージに保存
      localStorage.setItem("spark_task_data", JSON.stringify(sparkTaskData))
      localStorage.setItem("calendar_tasks", JSON.stringify(calendarTasks))

      // テスト日程を設定
      const testStartDate = addDays(today, 14) // 2週間後
      const testEndDate = addDays(testStartDate, 1) // テスト開始日の翌日

      localStorage.setItem("startDate", testStartDate.toISOString())
      localStorage.setItem("endDate", testEndDate.toISOString())

      // カレンダータスク更新イベントを発火
      window.dispatchEvent(new CustomEvent("calendar-tasks-updated"))

      // 自動生成フラグを設定
      localStorage.setItem("auto_generate_calendar_tasks", "true")

      toast({
        title: "モックデータを生成しました",
        description: "カウントダウンページで確認できます。",
        duration: 3000,
      })
    } catch (error) {
      console.error("モックデータの生成に失敗しました:", error)
      toast({
        title: "モックデータの生成に失敗しました",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  return (
    <div className="p-4 bg-yellow-50 rounded-lg mb-4 border border-yellow-200">
      <h3 className="font-medium mb-2">テスト用モックデータ</h3>
      <p className="text-sm text-gray-600 mb-3">
        カウントダウン機能のテスト用にモックデータを生成します。
        これにより、スパークリストとカレンダーの連携を確認できます。
      </p>
      <Button onClick={generateMockData} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
        モックデータを生成
      </Button>
    </div>
  )
}
