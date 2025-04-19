"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export function NameInput() {
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (name.length < 1) {
      setError("名前を入力してください")
      return
    }

    if (name.length > 12) {
      setError("名前は12文字以内で入力してください")
      return
    }

    if (!userId) {
      setError("ユーザー情報が取得できませんでした。再度ログインしてください。")
      return
    }

    setIsLoading(true)

    try {
      console.log("名前更新処理を開始:", name)
      
      // usersテーブルを使用して名前を更新
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id, display_name')
        .eq('id', userId)
        .single()

      if (userCheckError && userCheckError.code !== 'PGRST116') {
        console.error("ユーザー確認エラー:", userCheckError)
        throw new Error(`ユーザー情報の確認に失敗しました: ${userCheckError.message}`)
      }

      if (!existingUser) {
        console.error("ユーザーレコードが見つかりません")
        throw new Error("ユーザー情報が見つかりません。アバター選択からやり直してください。")
      }

      // 名前の重複チェック（オプション - 必要に応じて実装）
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('display_name', name)
        .neq('id', userId) // 自分以外で同じ名前のユーザーを検索

      if (checkError) {
        console.error("名前重複チェックエラー:", checkError)
        throw new Error('名前の重複チェックに失敗しました')
      }

      if (existingUsers && existingUsers.length > 0) {
        setError("この名前は既に使われています。別の名前を入力してください")
        setIsLoading(false)
        return
      }

      // ユーザーレコードを更新
      console.log("ユーザー名を更新します:", name)
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          display_name: name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) {
        console.error("名前更新エラー:", updateError)
        throw updateError
      }

      console.log("名前更新成功:", name)

      // 登録完了画面に遷移
      router.push("/onboarding/complete")
    } catch (error: any) {
      console.error('名前保存エラー:', error)
      setError(error.message || '名前の保存中にエラーが発生しました。再度お試しください。')
      alert(`名前保存エラーの詳細: ${error.message || 'エラーが発生しました'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">名前を入力</CardTitle>
        <CardDescription className="text-center">アプリ内で使用する名前を入力してください</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名前（1〜12文字）</Label>
            <Input id="name" value={name} onChange={handleNameChange} placeholder="名前を入力" maxLength={12} />
            <p className="text-xs text-gray-500 text-right">{name.length}/12文字</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              "登録する"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
