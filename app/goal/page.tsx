import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { GoalDisplay } from "@/components/goal/goal-display"

export default function GoalPage() {
  return (
    <main className="flex min-h-screen flex-col pb-20">
      <Header title="ゴールナビ" />
      <GoalDisplay />
      <BottomNavigation />
    </main>
  )
}
