"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, HelpCircle, FileText, LogOut, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"

export function ProfileView() {
  const router = useRouter()

  const handleLogout = () => {
    // 実際の実装ではSupabaseでログアウト処理を行います
    router.push("/")
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-24 h-24 rounded-full overflow-hidden mb-2">
            <Image
              src="/placeholder.svg?height=100&width=100"
              alt="User Avatar"
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
          </div>
          <CardTitle className="text-2xl">ばなな</CardTitle>
          <CardDescription>中学2年生</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-between" onClick={() => router.push("/profile/edit")}>
              <div className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                <span>アカウント</span>
              </div>
              <ChevronRight className="h-5 w-5" />
            </Button>

            <Separator />

            <Button variant="ghost" className="w-full justify-between" onClick={() => router.push("/faq")}>
              <div className="flex items-center">
                <HelpCircle className="mr-2 h-5 w-5" />
                <span>よくある質問</span>
              </div>
              <ChevronRight className="h-5 w-5" />
            </Button>

            <Button variant="ghost" className="w-full justify-between" onClick={() => router.push("/terms")}>
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                <span>利用規約</span>
              </div>
              <ChevronRight className="h-5 w-5" />
            </Button>

            <Separator />

            <Button variant="ghost" className="w-full justify-between text-red-500" onClick={handleLogout}>
              <div className="flex items-center">
                <LogOut className="mr-2 h-5 w-5" />
                <span>ログアウト</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
