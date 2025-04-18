"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AutoPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreatePlan: (settings: {
    levels: { basic: boolean; standard: boolean; advanced: boolean }
    reviewPeriod: number
    reviewDays: { [key: string]: boolean }
    problemRange?: { unsolved: boolean; incorrect: boolean; partial: boolean; complete: boolean }
  }) => void
  hasPlan?: boolean
}

export function AutoPlanDialog({ open, onOpenChange, onCreatePlan, hasPlan = false }: AutoPlanDialogProps) {
  const [studyLevels, setStudyLevels] = useState({
    basic: true,
    standard: true,
    advanced: false,
  })

  const [reviewDays, setReviewDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: true,
  })

  const [problemRange, setProblemRange] = useState({
    unsolved: true,
    incorrect: true,
    partial: true,
    complete: false,
  })

  const [reviewPeriod, setReviewPeriod] = useState(7)
  const [minReviewPeriod] = useState(1)
  const [maxReviewPeriod, setMaxReviewPeriod] = useState(14)
  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const [attemptedDay, setAttemptedDay] = useState<string | null>(null)

  // テスト開始日から最大復習期間を計算
  useEffect(() => {
    // ローカルストレージからテスト開始日を取得（実際のアプリではSupabaseから取得）
    const savedStartDate = localStorage.getItem("startDate")
    if (savedStartDate) {
      const date = new Date(savedStartDate)

      // 最大学習日数を計算
      const today = new Date()
      const diffTime = date.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // 最大復習日数は学習日数の半分（最低1日）
      const maxReview = Math.max(1, Math.floor(diffDays / 2))
      setMaxReviewPeriod(maxReview)

      // 現在の復習期間が最大値を超えている場合は調整
      if (reviewPeriod > maxReview) {
        setReviewPeriod(Math.min(7, maxReview)) // デフォルトは7日か最大値の小さい方
      }
    }
  }, [open]) // ダイアログが開かれるたびに再計算

  // 学習レベルの変更ハンドラー
  const handleLevelChange = (level: keyof typeof studyLevels) => {
    setStudyLevels((prev) => {
      const newLevels = { ...prev, [level]: !prev[level] }

      // すべてのレベルが選択されていない場合は変更を許可しない
      if (!newLevels.basic && !newLevels.standard && !newLevels.advanced) {
        return prev
      }

      return newLevels
    })
  }

  // 問題範囲の変更ハンドラー
  const handleProblemRangeChange = (range: keyof typeof problemRange) => {
    setProblemRange((prev) => ({
      ...prev,
      [range]: !prev[range],
    }))
  }

  // 復習曜日の変更ハンドラー
  const handleReviewDayChange = (day: keyof typeof reviewDays) => {
    // 現在の状態をコピー
    const newDays = { ...reviewDays, [day]: !reviewDays[day] }

    // すべての曜日が選択されているかチェック
    const allSelected = Object.values(newDays).every((selected) => selected)

    // すべて選択されている場合は警告ダイアログを表示
    if (allSelected) {
      setAttemptedDay(day) // 選択しようとした曜日を記録
      setShowWarningDialog(true)
      return
    }

    // そうでなければ状態を更新
    setReviewDays(newDays)
  }

  // 復習期間の変更ハンドラー
  const handleReviewPeriodChange = (value: string) => {
    setReviewPeriod(Number.parseInt(value))
  }

  // 学習計画作成ハンドラー
  const handleCreatePlan = () => {
    const settings = {
      levels: studyLevels,
      reviewPeriod,
      reviewDays,
    }

    // hasPlanがtrueの場合のみproblemRangeを追加
    if (hasPlan) {
      onCreatePlan({
        ...settings,
        problemRange,
      })
    } else {
      onCreatePlan(settings)
    }

    onOpenChange(false)
  }

  // 警告ダイアログを閉じるハンドラー
  const handleCloseWarning = () => {
    setShowWarningDialog(false)
    // attemptedDayはリセットしない（元の画面に戻るため）
  }

  // 復習期間のオプションを生成
  const generateReviewPeriodOptions = () => {
    const options = []
    for (let i = minReviewPeriod; i <= maxReviewPeriod; i++) {
      options.push(
        <SelectItem key={i} value={i.toString()}>
          {i === 7 ? <strong>{i}日間（オススメ）</strong> : `${i}日間`}
        </SelectItem>,
      )
    }
    return options
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          // 警告ダイアログが表示されている場合は、メインダイアログを閉じないようにする
          if (!showWarningDialog) {
            onOpenChange(newOpen)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={() => {
              // 警告ダイアログが表示されている場合は、メインダイアログを閉じないようにする
              if (!showWarningDialog) {
                onOpenChange(false)
              }
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">閉じる</span>
          </button>
          <DialogHeader>
            <DialogTitle className="text-xl">
              {hasPlan ? "自動で学習計画を修正する" : "自動で学習計画を立てる"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 問題範囲の選択 - hasPlanがtrueの場合のみ表示 */}
            {hasPlan && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">修正する問題の範囲</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="range-unsolved"
                      checked={problemRange.unsolved}
                      onCheckedChange={() => handleProblemRangeChange("unsolved")}
                    />
                    <Label htmlFor="range-unsolved">未着手の問題</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="range-incorrect"
                      checked={problemRange.incorrect}
                      onCheckedChange={() => handleProblemRangeChange("incorrect")}
                    />
                    <Label htmlFor="range-incorrect">誤答（×）の問題</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="range-partial"
                      checked={problemRange.partial}
                      onCheckedChange={() => handleProblemRangeChange("partial")}
                    />
                    <Label htmlFor="range-partial">一部正解（△）の問題</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="range-complete"
                      checked={problemRange.complete}
                      onCheckedChange={() => handleProblemRangeChange("complete")}
                    />
                    <Label htmlFor="range-complete">完答（⚪︎）の問題</Label>
                  </div>
                </div>
              </div>
            )}

            {/* 学習モード */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">学習モード（学習計画に取込む問題のレベル）</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="level-basic"
                    checked={studyLevels.basic}
                    onCheckedChange={() => handleLevelChange("basic")}
                  />
                  <Label htmlFor="level-basic">基本問題</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="level-standard"
                    checked={studyLevels.standard}
                    onCheckedChange={() => handleLevelChange("standard")}
                  />
                  <Label htmlFor="level-standard">標準問題</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="level-advanced"
                    checked={studyLevels.advanced}
                    onCheckedChange={() => handleLevelChange("advanced")}
                  />
                  <Label htmlFor="level-advanced">発展問題</Label>
                </div>
              </div>
            </div>

            {/* 復習期間 - プルダウン表示 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">試験直前の復習期間（日数）</h3>
              <Select value={reviewPeriod.toString()} onValueChange={handleReviewPeriodChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="復習期間を選択" />
                </SelectTrigger>
                <SelectContent>{generateReviewPeriodOptions()}</SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                試験直前の復習期間に充てます。実際に問題に取り組む学習期間は、今日から復習期間までになります。
              </p>
            </div>

            {/* 復習曜日 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">復習をする曜日（新しい問題に取り組まない日）</h3>
              <div className="grid grid-cols-7 gap-2">
                {[
                  { key: "monday", label: "月" },
                  { key: "tuesday", label: "火" },
                  { key: "wednesday", label: "水" },
                  { key: "thursday", label: "木" },
                  { key: "friday", label: "金" },
                  { key: "saturday", label: "土" },
                  { key: "sunday", label: "日" },
                ].map((day) => (
                  <div key={day.key} className="flex flex-col items-center">
                    <Checkbox
                      id={`day-${day.key}`}
                      checked={reviewDays[day.key as keyof typeof reviewDays]}
                      onCheckedChange={() => handleReviewDayChange(day.key as keyof typeof reviewDays)}
                    />
                    <Label htmlFor={`day-${day.key}`} className="mt-1">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreatePlan} className="bg-blue-500 hover:bg-blue-600">
              {hasPlan ? "学習計画を修正" : "学習計画を作成"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 警告ダイアログ */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>選択できません</AlertDialogTitle>
            <AlertDialogDescription>
              すべての曜日を復習日に設定することはできません。少なくとも1日は新しい問題に取り組む日が必要です。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseWarning}>了解しました</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
