"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

const mathBooks = [
  { id: "math1-algebra", name: "体系問題集 数学１代数編", available: true },
  { id: "math1-geometry", name: "体系問題集 数学１幾何編", available: false },
  { id: "math2-algebra", name: "体系問題集 数学２代数編", available: false },
  { id: "math2-geometry", name: "体系問題集 数学２幾何編", available: false },
]

export function MathBookSelection() {
  const router = useRouter()

  const handleSelectBook = (bookId: string, available: boolean) => {
    if (available) {
      router.push("/goal/range-selection")
    } else {
      alert("現在、体系問題集 数学１代数編のみ選択可能です。")
    }
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center">問題集を選択</CardTitle>
          <CardDescription className="text-center">取り組みたい問題集を選んでください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mathBooks.map((book) => (
            <div
              key={book.id}
              className={`bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center cursor-pointer shadow-md hover:shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1 ${!book.available ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handleSelectBook(book.id, book.available)}
            >
              <div className="flex items-center">
                <Calculator className="mr-2 h-5 w-5 text-blue-500" />
                <span>{book.name}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.push("/goal")}>
            戻る
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
