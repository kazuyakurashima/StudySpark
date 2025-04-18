"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Image from "next/image"

const avatars = [
  { id: 1, type: "male", src: "/placeholder.svg?height=100&width=100" },
  { id: 2, type: "male", src: "/placeholder.svg?height=100&width=100" },
  { id: 3, type: "female", src: "/placeholder.svg?height=100&width=100" },
  { id: 4, type: "female", src: "/placeholder.svg?height=100&width=100" },
  { id: 5, type: "neutral", src: "/placeholder.svg?height=100&width=100" },
  { id: 6, type: "neutral", src: "/placeholder.svg?height=100&width=100" },
]

export function AvatarSelection() {
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null)
  const router = useRouter()

  const handleContinue = () => {
    if (selectedAvatar !== null) {
      // 実際の実装ではSupabaseに保存します
      router.push("/onboarding/name")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">アバターを選択</CardTitle>
        <CardDescription className="text-center">あなたを表すアバターを選んでください</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="avatar-container">
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
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-[#03a9f4] hover:bg-[#0288d1] text-white"
          onClick={handleContinue}
          disabled={selectedAvatar === null}
        >
          名前入力へ
        </Button>
      </CardFooter>
    </Card>
  )
}
