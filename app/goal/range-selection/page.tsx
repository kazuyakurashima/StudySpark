import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { RangeSelection } from "@/components/goal/range-selection"

export default function RangeSelectionPage() {
  return (
    <main className="flex min-h-screen flex-col pb-20">
      <Header title="試験範囲設定" showBackButton backUrl="/goal/math-books" />
      <RangeSelection />
      <BottomNavigation />
    </main>
  )
}
