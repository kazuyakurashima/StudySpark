"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { Card } from "@/components/ui/card"
import { MoreVertical, CheckCircle, AlertTriangle, Circle, Calendar, ArrowRight, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SparkTask } from "@/types/task"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { toSafeDate } from "@/utils/date-utils"

interface TaskItemProps {
  task: SparkTask
  showOriginalDate?: boolean
  onPostpone: () => void
  onPostponeToDate: (date: Date) => void
  onStatusChange: (status: "complete" | "partial" | "incorrect" | null) => void
}

export function TaskItem({
  task,
  showOriginalDate = false,
  onPostpone,
  onPostponeToDate,
  onStatusChange,
}: TaskItemProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [activeStatus, setActiveStatus] = useState<"complete" | "partial" | "incorrect" | null>(null)

  // 日付選択ハンドラー
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onPostponeToDate(date)
      setShowDatePicker(false)
    }
  }

  // タッチ開始時のハンドラー
  const handleTouchStart = (status: "complete" | "partial" | "incorrect" | null) => {
    setActiveStatus(status)
  }

  // タッチ終了時のハンドラー
  const handleTouchEnd = (status: "complete" | "partial" | "incorrect" | null, e: React.TouchEvent) => {
    e.preventDefault() // デフォルトのタッチイベントを防止
    e.stopPropagation() // イベントの伝播を防止
    onStatusChange(status)
    setActiveStatus(null)
  }

  // 安全に日付を変換
  const safeDueDate = toSafeDate(task.dueDate)
  const safeOriginalDate = toSafeDate(task.originalDate)

  return (
    <Card
      className={cn(
        "p-3 text-sm border transition-all hover:shadow-md relative",
        task.status === "complete"
          ? "bg-blue-50 border-blue-200"
          : task.status === "partial"
            ? "bg-amber-50 border-amber-200"
            : task.status === "incorrect"
              ? "bg-red-50 border-red-200"
              : "bg-white",
      )}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <div className="font-medium">{task.title}</div>
          {showOriginalDate && safeOriginalDate && safeDueDate && (
            <div className="text-xs text-gray-500 mt-1 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>
                {format(safeOriginalDate, "M/d")} <ArrowRight className="h-3 w-3 inline mx-1" />{" "}
                {format(safeDueDate, "M/d")}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full touch-target",
              task.status === "complete" ? "bg-blue-100 text-blue-500" : "text-gray-400 hover:text-blue-500",
              activeStatus === "complete" ? "transform scale-90" : "",
            )}
            onClick={(e) => {
              e.stopPropagation()
              onStatusChange("complete")
            }}
            onTouchStart={() => handleTouchStart("complete")}
            onTouchEnd={(e) => handleTouchEnd("complete", e)}
          >
            <CheckCircle className="h-5 w-5" />
            <span className="sr-only">完答</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full touch-target",
              task.status === "partial" ? "bg-amber-100 text-amber-500" : "text-gray-400 hover:text-amber-500",
              activeStatus === "partial" ? "transform scale-90" : "",
            )}
            onClick={(e) => {
              e.stopPropagation()
              onStatusChange("partial")
            }}
            onTouchStart={() => handleTouchStart("partial")}
            onTouchEnd={(e) => handleTouchEnd("partial", e)}
          >
            <AlertTriangle className="h-5 w-5" />
            <span className="sr-only">一部正解</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full touch-target",
              task.status === "incorrect" ? "bg-red-100 text-red-500" : "text-gray-400 hover:text-red-500",
              activeStatus === "incorrect" ? "transform scale-90" : "",
            )}
            onClick={(e) => {
              e.stopPropagation()
              onStatusChange("incorrect")
            }}
            onTouchStart={() => handleTouchStart("incorrect")}
            onTouchEnd={(e) => handleTouchEnd("incorrect", e)}
          >
            <Circle className="h-5 w-5" />
            <span className="sr-only">誤答</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full touch-target">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">タスク操作</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onPostpone}>
                <ChevronRight className="h-4 w-4 mr-2" />
                明日に繰り越す
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDatePicker(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                別の日に繰り越す
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 日付選択カレンダー - モバイル表示の問題を修正 */}
      {showDatePicker && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowDatePicker(false)}
        >
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-4 text-center">繰り越す日を選択</h3>
            <DatePicker date={safeDueDate || undefined} setDate={handleDateSelect} />
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowDatePicker(false)}>
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
