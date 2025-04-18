import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { MathBookSelection } from "@/components/goal/math-book-selection"

export default function MathBooksPage() {
  return (
    <main className="flex min-h-screen flex-col pb-20">
      <Header title="問題集選択" showBackButton backUrl="/goal" />
      <MathBookSelection />
      <BottomNavigation />
    </main>
  )
}
