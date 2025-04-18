"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Flag, Edit2, BookOpen, Calculator, Globe, Beaker, BookMarked, ChevronRight } from 'lucide-react'
import { useRouter } from "next/navigation"
import { UserAvatar } from "@/components/ui/user-avatar"
import { CoachAvatar } from "@/components/ui/coach-avatar"

interface GoalDisplayProps {
  testName?: string
  startDate?: string
  endDate?: string
  targetRank?: number
  totalStudents?: number
  userName?: string
  userAvatarSrc?: string | null
  coachName?: string
  coachAvatarSrc?: string | null
}

export function GoalDisplay({
  testName: propTestName,
  startDate: propStartDate,
  endDate: propEndDate,
  targetRank: propTargetRank,
  totalStudents: propTotalStudents,
  userName = "ばなな",
  userAvatarSrc = null,
  coachName = "コーチ",
  coachAvatarSrc = null,
}: GoalDisplayProps) {
  const [testName, setTestName] = useState<string>(propTestName || "第１回定期考査")
  const [startDate, setStartDate] = useState<string>(propStartDate || "2025年5月20日")
  const [endDate, setEndDate] = useState<string>(propEndDate || "2025年5月21日")
  const [targetRank, setTargetRank] = useState<number>(propTargetRank || 10)
  const [totalStudents, setTotalStudents] = useState<number>(propTotalStudents || 120)
  const [goalReason, setGoalReason] = useState<string>("")
  const router = useRouter()

  // 科目データ
  const subjects = [
    { id: "english", name: "英語", icon: <BookOpen className="h-6 w-6" /> },
    { id: "math", name: "数学", icon: <Calculator className="h-6 w-6" /> },
    { id: "japanese", name: "国語", icon: <BookMarked className="h-6 w-6" /> },
    { id: "science", name: "理科", icon: <Beaker className="h-6 w-6" /> },
    { id: "social", name: "社会", icon: <Globe className="h-6 w-6" /> },
  ]

  // 科目選択ハンドラー
  const handleSelectSubject = (subjectId: string) => {
    if (subjectId === "math") {
      router.push("/goal/math-books")
    } else {
      // 他の科目は現在実装されていません
      alert("現在、数学のみ選択可能です。")
    }
  }

  // ローカルストレージからデータを読み込む（実際のアプリではSupabaseから取得）
  useEffect(() => {
    const savedTestName = localStorage.getItem("testName")
    const savedCustomTestName = localStorage.getItem("customTestName")
    const savedStartDate = localStorage.getItem("startDate")
    const savedEndDate = localStorage.getItem("endDate")
    const savedTargetRank = localStorage.getItem("targetRank")
    const savedTotalStudents = localStorage.getItem("totalStudents")
    const savedGoalReason = localStorage.getItem("goalReason")

    if (savedTestName) {
      if (savedTestName === "自分でテスト名を入力" && savedCustomTestName) {
        setTestName(savedCustomTestName)
      } else {
        setTestName(savedTestName)
      }
    }

    if (savedStartDate) {
      const date = new Date(savedStartDate)
      setStartDate(`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`)
    }

    if (savedEndDate) {
      const date = new Date(savedEndDate)
      setEndDate(`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`)
    }

    if (savedTargetRank) {
      setTargetRank(Number(savedTargetRank))
    }

    if (savedTotalStudents) {
      setTotalStudents(Number(savedTotalStudents))
    }

    if (savedGoalReason) {
      setGoalReason(savedGoalReason)
    }
  }, [])

  // 目標データが更新されたときのイベントリスナー
  useEffect(() => {
    const handleGoalDataUpdated = (event: CustomEvent<{ targetRank: number; totalStudents: number }>) => {
      const { targetRank: newTargetRank, totalStudents: newTotalStudents } = event.detail
      setTargetRank(newTargetRank)
      setTotalStudents(newTotalStudents)
    }

    // TypeScriptでCustomEventを使用するための型アサーション
    window.addEventListener("goalDataUpdated", handleGoalDataUpdated as EventListener)

    return () => {
      window.removeEventListener("goalDataUpdated", handleGoalDataUpdated as EventListener)
    }
  }, [])

  // 目盛りラベルを動的に生成する関数
  const generateRankLabels = (total: number) => {
    // 学年人数に応じて適切な間隔で5つのラベルを生成
    const step = Math.ceil(total / 4)
    return [
      1, // 常に1位から始める
      Math.ceil(step),
      Math.ceil(step * 2),
      Math.ceil(step * 3),
      total, // 常に学年人数で終わる
    ]
  }

  // 目標順位の位置をパーセンテージで計算（左端が1位、右端が最下位）
  const rankPercentage = (targetRank / totalStudents) * 100

  return (
    <div className="p-4">
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-center">{testName}</CardTitle>
          <CardDescription className="text-center">
            {startDate} 〜 {endDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <div className="space-y-8">
            <div className="text-center mb-10 pt-2">
              <p className="text-sm text-gray-500 mb-2">目標順位</p>
              <p className="text-3xl font-bold">
                {targetRank}位 / {totalStudents}人中
              </p>
            </div>

            <div className="rank-slider-container px-4 mt-12 mb-16">
              {/* 目盛りラベル */}
              <div className="rank-labels flex justify-between mb-6 px-1 text-gray-500">
                {generateRankLabels(totalStudents).map((label, index) => (
                  <span key={index}>{label}位</span>
                ))}
              </div>

              {/* スライダー本体 */}
              <div className="rank-slider relative h-3 rounded-full mb-10">
                {/* 区間ごとに色を変えた背景 */}
                <div className="absolute inset-0 flex w-full">
                  <div className="w-1/4 h-full bg-gray-200 rounded-l-full"></div>
                  <div className="w-1/4 h-full bg-gray-300"></div>
                  <div className="w-1/4 h-full bg-gray-200"></div>
                  <div className="w-1/4 h-full bg-gray-300 rounded-r-full"></div>
                </div>

                {/* 目盛り線 */}
                <div className="absolute -top-3 left-0 w-full flex justify-between px-1">
                  {generateRankLabels(totalStudents).map((_, index) => (
                    <div key={index} className="h-3 w-0.5 bg-gray-500"></div>
                  ))}
                </div>

                {/* 目標位置の旗 */}
                <div className="absolute -top-9" style={{ left: `${rankPercentage}%` }}>
                  <Flag className="h-6 w-6 text-[#00c6ff]" />
                </div>

                {/* 目標順位のテキスト */}
                <div
                  className="absolute top-6 font-bold text-center"
                  style={{
                    left: `${rankPercentage}%`,
                    transform: "translateX(-50%)",
                    minWidth: "40px",
                  }}
                >
                  {targetRank}位
                </div>
              </div>
            </div>

            <div className="px-4 pt-4">
              <Button
                className="w-full flex items-center justify-center goal-button py-4 text-base hover-effect"
                onClick={() => router.push("/goal/edit")}
              >
                <Edit2 className="mr-2 h-5 w-5" />
                ゴールを設定・編集
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">なぜ{targetRank}位を目指すのか？</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 pb-6">
          {/* ユーザーのコメント */}
          <div className="mb-6">
            <div className="flex items-start space-x-3 mb-2">
              <UserAvatar size={28} className="mt-1" />
              <div>
                <p className="text-sm font-medium">{userName}の想い</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-5 text-gray-700 leading-relaxed">
              {goalReason ||
                "前回は20位だったけど、今回は10位以内を目指したい。毎日コツコツ勉強して、特に苦手な数学を克服したい。目標を達成できたら自分へのご褒美にゲームを買いたいな。"}
            </div>
          </div>

          {/* コーチからの返信 */}
          <div className="mb-6">
            <div className="flex items-start space-x-3 mb-2">
              <CoachAvatar size={28} className="mt-1" />
              <div>
                <p className="text-sm font-medium">{coachName}からのメッセージ</p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-5 text-gray-700 leading-relaxed">
              素晴らしい目標だね！前回の20位から{targetRank}
              位を目指すのは大きなチャレンジだけど、毎日コツコツ勉強する姿勢があれば必ず達成できるよ。特に苦手な数学を克服するために、一緒に頑張っていこう！
            </div>
          </div>

          <Button
            className="w-full flex items-center justify-center goal-button py-4 text-base hover-effect"
            onClick={() => router.push("/goal/reason/edit")}
          >
            <Edit2 className="mr-2 h-5 w-5" />
            ゴールへの想いを設定・編集
          </Button>
        </CardContent>
      </Card>

      {/* スパーク機能（科目選択）をゴールナビに追加 */}
      <Card className="mt-6 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">スパーク（習得）する科目を選びましょう</CardTitle>
          <CardDescription>取り組みたい科目を選択してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="subject-button bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center cursor-pointer shadow-md hover:shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1"
                onClick={() => handleSelectSubject(subject.id)}
              >
                <div className="flex items-center">
                  <div className="mr-2 text-blue-500">{subject.icon}</div>
                  <span className="text-lg">{subject.name}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
