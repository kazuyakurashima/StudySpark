"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect } from "react"

export function OnboardingCompletion() {
  const router = useRouter()

  useEffect(() => {
    localStorage.setItem("onboarding_completed", "true")
    console.log("ローカルストレージに onboarding_completed=true をセットしました")
  }, [])

  const handleContinue = () => {
    router.push("/home")
  }

  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center rainbow-text">登録完了！</CardTitle>
          <div className="rainbow-line-container">
            <div className="rainbow-line"></div>
          </div>
          <CardDescription className="text-center flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2"
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                stroke="#00c6ff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span className="text-[#00c6ff] font-medium">StudySpark</span><span>へようこそ！</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>これからあなたの学習をサポートします。</p>
          <p>まずは目標を設定して、学習を始めましょう！</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-[#00c6ff] hover:bg-[#0288d1] text-white" onClick={handleContinue}>
            始める
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
