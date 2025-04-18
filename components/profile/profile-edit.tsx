"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Edit2, Camera } from "lucide-react"
import Image from "next/image"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const avatars = [
  { id: 1, type: "male", src: "/placeholder.svg?height=100&width=100" },
  { id: 2, type: "male", src: "/placeholder.svg?height=100&width=100" },
  { id: 3, type: "female", src: "/placeholder.svg?height=100&width=100" },
  { id: 4, type: "female", src: "/placeholder.svg?height=100&width=100" },
  { id: 5, type: "neutral", src: "/placeholder.svg?height=100&width=100" },
  { id: 6, type: "neutral", src: "/placeholder.svg?height=100&width=100" },
]

export function ProfileEdit() {
  const [name, setName] = useState("ばなな")
  const [selectedAvatar, setSelectedAvatar] = useState(1)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  const handleSave = () => {
    // 実際の実装ではSupabaseに保存します
    setIsEditing(false)
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center">プロフィール編集</CardTitle>
          <CardDescription className="text-center">プロフィール情報を編集できます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto">
                <Image
                  src={avatars.find((a) => a.id === selectedAvatar)?.src || "/placeholder.svg?height=100&width=100"}
                  alt="User Avatar"
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" className="absolute bottom-0 right-0 rounded-full w-8 h-8">
                    <Camera className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>アバターを選択</SheetTitle>
                    <SheetDescription>新しいアバターを選んでください</SheetDescription>
                  </SheetHeader>
                  <div className="avatar-container mt-4">
                    {avatars.map((avatar) => (
                      <div
                        key={avatar.id}
                        className={`avatar-item ${selectedAvatar === avatar.id ? "selected" : ""}`}
                        onClick={() => setSelectedAvatar(avatar.id)}
                      >
                        <Image
                          src={avatar.src || "/placeholder.svg"}
                          alt={`Avatar ${avatar.id}`}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>
            {isEditing ? (
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={12} />
            ) : (
              <div className="flex items-center justify-between p-2 border rounded-md">
                <span>{name}</span>
                <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            {isEditing && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>{name.length}/12文字</span>
                <Button size="sm" onClick={handleSave}>
                  保存
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.push("/profile")}>
            戻る
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
