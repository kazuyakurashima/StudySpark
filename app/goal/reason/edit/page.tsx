import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { GoalReasonEdit } from "@/components/goal/goal-reason-edit"

export default function GoalReasonEditPage() {
  return (
    <main className="flex min-h-screen flex-col pb-20">
      <Header title="ゴールへの想いを編集" showBackButton backUrl="/goal" />
      <GoalReasonEdit />
      <BottomNavigation />
    </main>
  )
}
