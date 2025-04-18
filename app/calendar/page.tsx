import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { CalendarView } from "@/components/calendar/calendar-view"
import { Suspense } from "react"

export default function CalendarPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header title="カウントダウン" />
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<div className="p-4">Loading calendar...</div>}>
          <CalendarView initialMode="day" />
        </Suspense>
      </div>
      <BottomNavigation />
    </main>
  )
}
