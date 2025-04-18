"use client"
import { DayView } from "./day-view"
import { WeekView } from "./week-view"
import { MonthView } from "./month-view"

interface TaskViewSwitcherProps {
  currentDate: Date
  testDates: {
    start: Date
    end: Date
  }
  viewMode: "day" | "week" | "month"
}

export function TaskViewSwitcher({ currentDate, testDates, viewMode }: TaskViewSwitcherProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        {viewMode === "day" && <DayView currentDate={currentDate} />}
        {viewMode === "week" && <WeekView currentDate={currentDate} />}
        {viewMode === "month" && <MonthView currentDate={currentDate} testDates={testDates} />}
      </div>
    </div>
  )
}
