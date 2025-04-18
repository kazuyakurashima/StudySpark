import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { GoalReason } from "@/components/goal/goal-reason"

export default function GoalReasonPage() {
  return (
    <main className="flex min-h-screen flex-col pb-20">
      <Header title="目標達成への思い" showBackButton backUrl="/goal" />
      <GoalReason />
      <BottomNavigation />
    </main>
  )
}
