"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { CalendarIcon, AlertCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { CoachAvatar } from "@/components/ui/coach-avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function GoalForm() {
  const [testName, setTestName] = useState<string>("")
  const [customTestName, setCustomTestName] = useState<string>("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [targetRank, setTargetRank] = useState<string>("")
  const [totalStudents, setTotalStudents] = useState<string>("")
  const [step, setStep] = useState(1)
  const [inputError, setInputError] = useState<string | null>(null)
  const [hasExistingData, setHasExistingData] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const router = useRouter()

  // 既存データの読み込み（実際のアプリではSupabaseから取得）
  useEffect(() => {
    // ローカルストレージからデータを取得（モック）
    const savedTestName = localStorage.getItem("testName")
    const savedCustomTestName = localStorage.getItem("customTestName")
    const savedStartDate = localStorage.getItem("startDate")
    const savedEndDate = localStorage.getItem("endDate")
    const savedTargetRank = localStorage.getItem("targetRank")
    const savedTotalStudents = localStorage.getItem("totalStudents")

    // データが存在する場合は設定
    if (savedTestName) {
      setTestName(savedTestName)
      if (savedTestName === "自分でテスト名を入力" && savedCustomTestName) {
        setCustomTestName(savedCustomTestName)
        setShowCustomInput(true)
      }
    }

    if (savedStartDate) {
      setStartDate(new Date(savedStartDate))
    }

    if (savedEndDate) {
      setEndDate(new Date(savedEndDate))
    }

    if (savedTargetRank && savedTotalStudents) {
      setTargetRank(savedTargetRank)
      setTotalStudents(savedTotalStudents)
      setHasExistingData(true)
    }
  }, [])

  const handleTestNameSelect = (value: string) => {
    setTestName(value)

    // ローカルストレージに保存（実際のアプリではSupabaseに保存）
    localStorage.setItem("testName", value)

    // 「自分でテスト名を入力」を選択した場合は入力欄を表示
    if (value === "自分でテスト名を入力") {
      setShowCustomInput(true)
      return // 次のステップに進まない
    } else {
      setShowCustomInput(false)
    }

    // デフォルトの日付を設定
    const today = new Date()
    let defaultStartDate, defaultEndDate

    switch (value) {
      case "第１回定期考査":
        defaultStartDate = new Date(today.getFullYear(), 4, 20) // 5月20日
        defaultEndDate = new Date(today.getFullYear(), 4, 21) // 5月21日
        break
      case "第２回定期考査":
        defaultStartDate = new Date(today.getFullYear(), 7, 30) // 8月30日
        defaultEndDate = new Date(today.getFullYear(), 7, 31) // 8月31日
        break
      case "第３回定期考査":
        defaultStartDate = new Date(today.getFullYear(), 10, 20) // 11月20日
        defaultEndDate = new Date(today.getFullYear(), 10, 21) // 11月21日
        break
      case "第４回定期考査":
        defaultStartDate = new Date(today.getFullYear(), 0, 30) // 1月30日
        defaultEndDate = new Date(today.getFullYear(), 0, 31) // 1月31日
        break
      default:
        defaultStartDate = undefined
        defaultEndDate = undefined
    }

    setStartDate(defaultStartDate)
    setEndDate(defaultEndDate)

    // 日付をローカルストレージに保存（実際のアプリではSupabaseに保存）
    if (defaultStartDate) {
      localStorage.setItem("startDate", defaultStartDate.toString())
    }
    if (defaultEndDate) {
      localStorage.setItem("endDate", defaultEndDate.toString())
    }

    setStep(2)
  }

  const handleCustomTestNameSubmit = () => {
    if (customTestName.trim() === "") return

    // カスタムテスト名をローカルストレージに保存
    localStorage.setItem("customTestName", customTestName)

    // 次のステップに進む
    setStep(2)
  }

  const handleDateConfirm = () => {
    if (startDate && endDate) {
      // 終了日が開始日より前の場合はエラーを表示
      if (endDate < startDate) {
        setInputError("終了日は開始日以降の日付を選択してください")
        return
      }

      // 日付をローカルストレージに保存（実際の実装ではSupabaseに保存）
      localStorage.setItem("startDate", startDate.toString())
      localStorage.setItem("endDate", endDate.toString())

      setStep(3)
      // ステップ3に移行する際にエラーをリセット
      setInputError(null)
    }
  }

  const handleRankSubmit = () => {
    // 目標順位と学年人数をローカルストレージに保存（実際のアプリではSupabaseに保存）
    localStorage.setItem("targetRank", targetRank)
    localStorage.setItem("totalStudents", totalStudents)

    // 即座に反映させるために、ゴールナビに遷移する前に一時的にデータを更新
    const event = new CustomEvent("goalDataUpdated", {
      detail: {
        targetRank: Number(targetRank),
        totalStudents: Number(totalStudents),
      },
    })
    window.dispatchEvent(event)

    // 実際の実装ではSupabaseに保存します
    router.push("/goal/reason")
  }

  const getEffectiveTestName = () => {
    if (testName === "自分でテスト名を入力") {
      return customTestName
    }
    return testName
  }

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, field: "targetRank" | "totalStudents") => {
    const value = e.target.value

    // 半角数字のみを許可する正規表現
    const numberRegex = /^[0-9]*$/

    if (value === "" || numberRegex.test(value)) {
      if (field === "targetRank") {
        setTargetRank(value)
      } else {
        setTotalStudents(value)
      }
      setInputError(null)
    } else {
      setInputError("半角数字のみ入力してください")
    }
  }

  const handleCustomTestNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomTestName(value)
    // ローカルストレージに保存（実際のアプリではSupabaseに保存）
    localStorage.setItem("customTestName", value)
  }

  return (
    <div className="p-4">
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">テスト名を選択</CardTitle>
            <CardDescription className="text-center">ゴールを設定するテスト名を選んでください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button
                variant={testName === "第１回定期考査" ? "default" : "outline"}
                className="w-full justify-start hover-effect"
                onClick={() => handleTestNameSelect("第１回定期考査")}
              >
                第１回定期考査
              </Button>
              <Button
                variant={testName === "第２回定期考査" ? "default" : "outline"}
                className="w-full justify-start hover-effect"
                onClick={() => handleTestNameSelect("第２回定期考査")}
              >
                第２回定期考査
              </Button>
              <Button
                variant={testName === "第３回定期考査" ? "default" : "outline"}
                className="w-full justify-start hover-effect"
                onClick={() => handleTestNameSelect("第３回定期考査")}
              >
                第３回定期考査
              </Button>
              <Button
                variant={testName === "第４回定期考査" ? "default" : "outline"}
                className="w-full justify-start hover-effect"
                onClick={() => handleTestNameSelect("第４回定期考査")}
              >
                第４回定期考査
              </Button>
              <Button
                variant={testName === "自分でテスト名を入力" ? "default" : "outline"}
                className="w-full justify-start hover-effect"
                onClick={() => handleTestNameSelect("自分でテスト名を入力")}
              >
                自分でテスト名を入力
              </Button>
            </div>

            {showCustomInput && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="custom-test-name">テスト名</Label>
                <Input
                  id="custom-test-name"
                  value={customTestName}
                  onChange={handleCustomTestNameChange}
                  placeholder="テスト名を入力"
                  autoFocus
                />
                <Button
                  className="w-full hover-effect"
                  onClick={handleCustomTestNameSubmit}
                  disabled={!customTestName.trim()}
                >
                  次へ
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">テスト期間を選択</CardTitle>
            <CardDescription className="text-center">
              {getEffectiveTestName()}の実施期間を選んでください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>開始日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start hover-effect">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "yyyy年MM月dd日", { locale: ja }) : "開始日を選択"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>終了日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start hover-effect">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "yyyy年MM月dd日", { locale: ja }) : "終了日を選択"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {inputError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{inputError}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2 pt-4">
              <Button variant="outline" className="flex-1 hover-effect" onClick={() => setStep(1)}>
                戻る
              </Button>
              <Button className="flex-1 hover-effect" onClick={handleDateConfirm} disabled={!startDate || !endDate}>
                次へ
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">目標順位を設定</CardTitle>
            <CardDescription className="text-center">
              {getEffectiveTestName()}での目標順位を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 既存データがある場合の表示 */}
            {hasExistingData && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-medium text-blue-800">前回の設定</p>
                <div className="flex justify-between mt-2">
                  <span>目標順位: {targetRank}位</span>
                  <span>学年人数: {totalStudents}人</span>
                </div>
              </div>
            )}

            {/* コーチのアドバイス吹き出し */}
            <div className="coach-advice-container mb-4">
              <div className="flex items-start space-x-3">
                <CoachAvatar size={40} className="flex-shrink-0 mt-1" />
                <div className="coach-advice-bubble">
                  <p className="text-sm">
                    目標順位と学年人数は<span className="font-bold">半角数字</span>で入力してね！
                    <br />
                    例: 10, 120
                  </p>
                </div>
              </div>
            </div>

            {inputError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{inputError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="target-rank">目標順位</Label>
              <Input
                id="target-rank"
                type="text"
                inputMode="numeric"
                value={targetRank}
                onChange={(e) => handleNumberInput(e, "targetRank")}
                placeholder="例: 10"
                className={inputError ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total-students">学年人数</Label>
              <Input
                id="total-students"
                type="text"
                inputMode="numeric"
                value={totalStudents}
                onChange={(e) => handleNumberInput(e, "totalStudents")}
                placeholder="例: 120"
                className={inputError ? "border-red-500" : ""}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button variant="outline" className="flex-1 hover-effect" onClick={() => setStep(2)}>
                戻る
              </Button>
              <Button
                className="flex-1 hover-effect"
                onClick={handleRankSubmit}
                disabled={
                  !targetRank ||
                  !totalStudents ||
                  Number.parseInt(targetRank) < 1 ||
                  Number.parseInt(targetRank) > Number.parseInt(totalStudents) ||
                  Number.parseInt(totalStudents) < 20 ||
                  Number.parseInt(totalStudents) > 1000 ||
                  !!inputError
                }
              >
                設定する
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
