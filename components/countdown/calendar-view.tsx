"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
} from "date-fns"
import { ja } from "date-fns/locale"
import React from "react"

export type ViewMode = "day" | "week" | "month"

interface CalendarViewProps {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
}

export function CalendarView({ viewMode, setViewMode }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // テスト日程（モック）
  const testDates = {
    start: new Date(2025, 4, 20), // 5月20日
    end: new Date(2025, 4, 21), // 5月21日
  }

  // 今日の日付
  const today = new Date()

  // カウントダウン日数の計算
  const daysUntilTest = Math.ceil((testDates.start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const isTestSoon = daysUntilTest <= 7 && daysUntilTest > 0

  // 月表示用の日付生成
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 前月と翌月の日付を取得
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // 今日に戻る
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // 日付フォーマット
  const formatDate = (date: Date) => {
    if (viewMode === "day") {
      return format(date, "yyyy年M月d日", { locale: ja })
    }
    return format(date, "yyyy年M月", { locale: ja })
  }

  // 曜日の表示
  const weekDays = ["日", "月", "火", "水", "木", "金", "土"]

  // 時間スロット（日表示・週表示用）
  const timeSlots = Array.from({ length: 24 }, (_, i) => `${i}:00`)

  return (
    <div className="p-4 bg-blue-50 flex-1">
      <div className="flex justify-center items-center mb-4 bg-white rounded-md p-2 shadow-sm">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="text-gray-700">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium text-gray-800 mx-4">{formatDate(currentDate)}</span>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="text-gray-700">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-center mb-2">
        <Button variant="outline" onClick={goToToday} className="text-sm">
          Today
        </Button>
      </div>

      <div className="bg-white rounded-md shadow-sm">
        {viewMode === "month" && (
          <div>
            <div className="calendar-header">
              {weekDays.map((day, index) => (
                <div key={index} className="calendar-day">
                  <span className={index === 0 || index === 6 ? "text-blue-500" : ""}>{day}</span>
                </div>
              ))}
            </div>

            <div className="calendar-grid">
              {monthDays.map((day, i) => {
                const isToday = isSameDay(day, today)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isTestDay = isSameDay(day, testDates.start) || isSameDay(day, testDates.end)

                return (
                  <div
                    key={i}
                    className={`calendar-cell ${isToday ? "selected-date" : ""} ${!isCurrentMonth ? "other-month" : ""} ${isTestDay ? "bg-red-100" : ""}`}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      <span>{format(day, "d")}</span>

                      {isTestDay && (
                        <div className="absolute bottom-1 left-0 right-0 text-center">
                          <span className="text-xs text-red-500">テスト</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {viewMode === "week" && (
          <div>
            <div className="week-grid">
              <div className="week-header"></div>
              {weekDays.map((day, index) => (
                <div key={index} className="week-header">
                  <span className={index === 0 || index === 6 ? "text-blue-500" : ""}>{day}</span>
                </div>
              ))}

              {timeSlots.slice(0, 12).map((time, i) => (
                <React.Fragment key={i}>
                  <div className="time-slot">{time}</div>
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const currentDay = addDays(startOfMonth(currentDate), dayIndex)
                    const isToday = isSameDay(currentDay, today)

                    return <div key={dayIndex} className={`day-column ${isToday ? "today" : ""}`}></div>
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {viewMode === "day" && (
          <div>
            <div className="flex justify-center mb-4 p-3">
              <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                <span className="font-bold">{format(currentDate, "d")}</span>
              </div>
              <div className="ml-2">
                <div className="text-blue-500 font-medium">{format(currentDate, "E", { locale: ja })}</div>
                <div className="text-sm text-gray-500">{format(currentDate, "yyyy年MM月", { locale: ja })}</div>
              </div>
            </div>

            <div className="time-grid">
              {timeSlots.slice(0, 12).map((time, i) => (
                <React.Fragment key={i}>
                  <div className="time-slot">{time}</div>
                  <div className="day-column"></div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {isTestSoon && (
        <div className="fixed bottom-20 right-4 bg-red-500 text-white p-2 rounded-lg shadow-lg animate-pulse">
          <p className="font-bold">テストまであと{daysUntilTest}日！</p>
        </div>
      )}
    </div>
  )
}
