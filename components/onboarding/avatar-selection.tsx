"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// 実際のファイルパスに合わせてアバター情報を更新
const avatars = [
  { id: "user1", type: "user1", src: "/images/avatars/users/user1.png" },
  { id: "user2", type: "user2", src: "/images/avatars/users/user2.png" },
  { id: "user3", type: "user3", src: "/images/avatars/users/user3.png" },
  { id: "user4", type: "user4", src: "/images/avatars/users/user4.png" },
  { id: "user5", type: "user5", src: "/images/avatars/users/user5.png" },
  { id: "user6", type: "user6", src: "/images/avatars/users/user6.png" },
]

export function AvatarSelection() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // ログインユーザーのIDを取得
  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserId(data.user.id)
        console.log("取得したユーザーID:", data.user.id)
      } else {
        // ユーザーがログインしていない場合はログイン画面にリダイレクト
        router.push('/auth/login')
      }
    }

    fetchUserId()
  }, [router])

  const handleContinue = async () => {
    if (selectedAvatar !== null && userId) {
      setIsLoading(true)
      setError(null)
      
      try {
        // 選択したアバターを取得
        const selectedAvatarData = avatars.find(avatar => avatar.id === selectedAvatar)

        if (!selectedAvatarData) {
          throw new Error('アバターが見つかりません')
        }

        console.log("選択したアバター:", selectedAvatarData)

        // まず、auth.usersテーブルに関連付けられたpublic.usersレコードが存在するか確認
        const { data: userData, error: userCheckError } = await supabase
          .from('users')
          .select('id, avatar_key, display_name, onboarding_completed')
          .eq('id', userId)
          .single()

        if (userCheckError && userCheckError.code !== 'PGRST116') {
          console.error("ユーザー確認エラー:", userCheckError)
          throw new Error(`ユーザー情報の確認に失敗しました: ${userCheckError.message}`)
        }

        // usersテーブルにレコードが存在しない場合は作成
        if (!userData) {
          console.log("ユーザーレコードが存在しないため作成します")
          
          const { data: authUser } = await supabase.auth.getUser()
          const email = authUser.user?.email || ''
          
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: email,
              display_name: '名前未設定', // 名前は次の画面で設定するので仮の値
              avatar_key: selectedAvatarData.id,
              onboarding_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()

          if (insertError) {
            console.error("ユーザー作成エラー:", insertError)
            throw new Error(`ユーザー情報の作成に失敗しました: ${insertError.message}`)
          }
          
          console.log("ユーザーを作成しました:", newUser)
        } else {
          // 既存のユーザーレコードを更新
          console.log("既存のユーザーレコードを更新します")
          
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({
              avatar_key: selectedAvatarData.id,
              // もし名前が設定されていない場合は仮の値を設定
              display_name: userData.display_name || '名前未設定',
              onboarding_completed: false, // まだオンボーディング完了ではない
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()

          if (updateError) {
            console.error("ユーザー更新エラー:", updateError)
            throw new Error(`ユーザー情報の更新に失敗しました: ${updateError.message}`)
          }
          
          console.log("ユーザーを更新しました:", updatedUser)
        }

        // 名前入力画面に遷移
        router.push("/onboarding/name")
      } catch (error: any) {
        console.error('アバター保存エラー:', error)
        setError('アバターの保存中にエラーが発生しました。再度お試しください。')
      } finally {
        setIsLoading(false)
      }
    } else {
      setError('アバターを選択してください')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">アバターを選択</CardTitle>
        <CardDescription className="text-center">一緒に冒険する自分を選ぼう！</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className={`cursor-pointer rounded-lg p-2 border-2 transition-all duration-200
                ${selectedAvatar === avatar.id 
                  ? 'border-blue-500 bg-blue-50 scale-105' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
              onClick={() => setSelectedAvatar(avatar.id)}
            >
              <div className="relative w-full aspect-square">
                <Image
                  src={avatar.src}
                  alt={`アバター`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover rounded"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleContinue}
          disabled={selectedAvatar === null || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            '名前入力へ'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
