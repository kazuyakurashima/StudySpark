import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { GoalForm } from "@/components/goal/goal-form"

export default function GoalEditPage() {
  return (
    <main className="flex min-h-screen flex-col pb-20">
      <Header title="ゴール設定" showBackButton backUrl="/goal" />
      <GoalForm />
      <BottomNavigation />
    </main>
  )
}
