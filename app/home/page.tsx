"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Flag, Calendar, MessageCircle, BookOpen, Sparkles } from "lucide-react"
import { SparkIcon } from "@/components/ui/spark-icon"
import Link from "next/link"
import { OnboardingTour } from "@/components/onboarding/onboarding-tour"

export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // 初回ログイン時のみオンボーディングを表示
  useEffect(() => {
    // コンポーネントがマウントされたことを示す
    setIsLoaded(true)

    // ローカルストレージからオンボーディング完了フラグを取得
    const onboardingCompleted = localStorage.getItem("onboarding_completed")

    // フラグがない場合は初回ログインとみなし、オンボーディングを表示
    if (!onboardingCompleted) {
      // 少し遅延させてDOMが完全に読み込まれた後に表示
      const timer = setTimeout(() => {
        setShowOnboarding(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  // オンボーディング完了時の処理
  const handleOnboardingComplete = () => {
    // オンボーディング完了フラグをローカルストレージに保存
    localStorage.setItem("onboarding_completed", "true")
    setShowOnboarding(false)
  }

  return (
    <main className="flex min-h-screen flex-col pb-20 bg-[#f0f4f8]">
      <Header title="ホーム" />

      <div className="p-4 space-y-4">
        <Card className="card-shadow border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl flex items-center justify-center">
              <SparkIcon className="h-7 w-7 mr-2 text-[#00c6ff]" />
              StudySparkへようこそ！
            </CardTitle>
            <CardDescription className="text-base">定期テストに向けて効果的に学習を進めましょう</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center">まずは以下の機能を使って学習を始めましょう：</p>

            <div className="grid grid-cols-2 gap-4">
              <Link href="/goal" className="block">
                <Card
                  id="goal-card"
                  className="category-card category-card-goal border-0 h-[140px] sm:h-[120px] shadow-lg hover:shadow-xl"
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                    <Flag className="h-8 w-8 mb-2 text-[#00c6ff]" />
                    <h3 className="font-medium">ゴールナビ</h3>
                    <p className="text-xs text-gray-500">目標を設定する</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/countdown" className="block">
                <Card
                  id="countdown-card"
                  className="category-card category-card-goal border-0 h-[140px] sm:h-[120px] shadow-lg hover:shadow-xl"
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                    <Calendar className="h-8 w-8 mb-2 text-[#00c6ff]" />
                    <h3 className="font-medium">カウントダウン</h3>
                    <p className="text-xs text-gray-500">テスト日までの日数</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/spark" className="block">
                <Card
                  id="spark-card"
                  className="category-card category-card-goal border-0 h-[140px] sm:h-[120px] shadow-lg hover:shadow-xl"
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                    <Sparkles className="h-8 w-8 mb-2 text-[#00c6ff]" />
                    <h3 className="font-medium">スパーク</h3>
                    <p className="text-xs text-gray-500">問題に取り組む</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/talk" className="block">
                <Card
                  id="talk-card"
                  className="category-card category-card-goal border-0 h-[140px] sm:h-[120px] shadow-lg hover:shadow-xl"
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                    <MessageCircle className="h-8 w-8 mb-2 text-[#00c6ff]" />
                    <h3 className="font-medium">トークルーム</h3>
                    <p className="text-xs text-gray-500">学習を振り返る</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow category-card category-card-textbook border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-[#00c6ff]" />
              体系問題集 数学１代数編
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>テスト範囲の問題数</span>
                <span className="font-medium">100問</span>
              </div>
              <div className="flex justify-between">
                <span>完答数</span>
                <span className="font-medium">25問</span>
              </div>

              <div className="mt-6">
                <div className="text-sm font-medium mb-2">
                  <span>スパーク達成率（%）</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-5">
                  <div className="bg-[#00c6ff] h-5 rounded-full" style={{ width: "25%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* オンボーディングツアー - コンポーネントがマウントされた後にのみ表示 */}
      {isLoaded && showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}

      <BottomNavigation />
    </main>
  )
}
