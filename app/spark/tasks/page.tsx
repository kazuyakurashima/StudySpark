import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { TaskList } from "@/components/spark/task-list"

export default function TasksPage() {
  return (
    <main className="flex min-h-screen flex-col pb-20">
      <Header title="スパークリスト" />
      <TaskList />
      <BottomNavigation />
    </main>
  )
}
