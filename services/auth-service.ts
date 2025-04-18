import { defaultStorage } from "@/lib/storage-adapter"
import type { UserProfile } from "@/types/user"
import { saveUserProfile } from "./profile-service"

const AUTH_TOKEN_KEY = "auth_token"
const AUTH_USER_KEY = "auth_user"

// ログイン状態確認
export async function isLoggedIn(): Promise<boolean> {
  try {
    const token = await defaultStorage.getItem<string>(AUTH_TOKEN_KEY)
    return !!token
  } catch (error) {
    console.error("Error checking login status:", error)
    return false
  }
}

// ログイン（モック実装）
export async function login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
  try {
    // 実際の実装ではAPIリクエストを行う
    // モック実装のため、常に成功する
    const mockToken = `mock_token_${Date.now()}`
    const mockUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: email.split("@")[0],
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
      onboardingCompleted: false,
    }

    await defaultStorage.setItem(AUTH_TOKEN_KEY, mockToken)
    await defaultStorage.setItem(AUTH_USER_KEY, mockUser)
    await saveUserProfile(mockUser)

    return { success: true }
  } catch (error) {
    console.error("Error during login:", error)
    return { success: false, message: "ログインに失敗しました。" }
  }
}

// ログアウト
export async function logout(): Promise<void> {
  try {
    await defaultStorage.removeItem(AUTH_TOKEN_KEY)
    await defaultStorage.removeItem(AUTH_USER_KEY)
  } catch (error) {
    console.error("Error during logout:", error)
    throw error
  }
}

// 認証トークン取得
export async function getAuthToken(): Promise<string | null> {
  try {
    return await defaultStorage.getItem<string>(AUTH_TOKEN_KEY)
  } catch (error) {
    console.error("Error getting auth token:", error)
    return null
  }
}

// 認証ユーザー取得
export async function getAuthUser(): Promise<UserProfile | null> {
  try {
    return await defaultStorage.getItem<UserProfile>(AUTH_USER_KEY)
  } catch (error) {
    console.error("Error getting auth user:", error)
    return null
  }
}
