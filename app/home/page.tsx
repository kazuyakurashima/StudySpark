"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Flag, Calendar, MessageCircle, BookOpen, Sparkles } from "lucide-react"
import { SparkIcon } from "@/components/ui/spark-icon"
import Link from "next/link"
import { OnboardingTour } from "@/components/onboarding/onboarding-tour"
import { supabase } from "@/lib/supabase"

export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // オンボーディングツアーの表示制御
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      setIsLoaded(true) // コンポーネントのマウントを示す

      try {
        // 1. Supabaseから現在のユーザー情報を取得
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // 2. usersテーブルからオンボーディング完了状態を取得
          const { data: userData, error } = await supabase
            .from('users')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single()

          if (error && error.code !== 'PGRST116') {
            console.error("ユーザーデータの取得エラー:", error)
            // エラー時もツアーは表示しない（あるいはエラー表示）
            setShowOnboarding(false)
            return
          }

          // 3. DBの状態を確認
          if (userData?.onboarding_completed) {
            // DBで完了済みなら、ローカルストレージも完了済みに更新し、ツアーは表示しない
            localStorage.setItem("onboarding_completed", "true")
            setShowOnboarding(false)
            console.log("DBで完了済みを確認。ローカルストレージを更新し、ツアーを非表示にしました。")
          } else {
            // DBで未完了の場合、ローカルストレージを確認
            const localOnboardingCompleted = localStorage.getItem("onboarding_completed")
            if (!localOnboardingCompleted) {
              // ローカルストレージにもフラグがない場合のみツアーを表示
              console.log("DB・ローカルストレージ共に未完了。オンボーディングツアーを表示します。")
              // 少し遅延させて表示
              const timer = setTimeout(() => {
                setShowOnboarding(true)
              }, 500) // 遅延を少し短く
              return () => clearTimeout(timer)
            } else {
              console.log("ローカルストレージで完了済み。ツアーを非表示にしました。")
              setShowOnboarding(false)
            }
          }
        } else {
          // ユーザーが取得できない場合はツアー非表示（ログイン画面等にいるはず）
          setShowOnboarding(false)
        }
      } catch (err) {
        console.error("オンボーディング状態チェック中にエラー:", err)
        setShowOnboarding(false) // エラー時も非表示
      }
    }

    checkOnboardingStatus()
  }, [])

  // オンボーディング完了時の処理
  const handleOnboardingComplete = () => {
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
