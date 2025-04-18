"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { UserProfile } from "@/types/user"
import * as AuthService from "@/services/auth-service"

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // 認証状態をチェック
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      const isLoggedInResult = await AuthService.isLoggedIn()
      setIsAuthenticated(isLoggedInResult)

      if (isLoggedInResult) {
        const authUser = await AuthService.getAuthUser()
        setUser(authUser)
      } else {
        setUser(null)
      }

      return isLoggedInResult
    } catch (err) {
      console.error("Failed to check auth:", err)
      setError(err instanceof Error ? err : new Error("認証状態の確認に失敗しました"))
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初期化時に認証状態をチェック
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // ログイン
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      const loginResult = await AuthService.login(email, password)

      if (loginResult.success) {
        const authUser = await AuthService.getAuthUser()
        setUser(authUser)
        setIsAuthenticated(true)
        return true
      } else {
        setError(new Error(loginResult.message || "ログインに失敗しました"))
        return false
      }
    } catch (err) {
      console.error("Failed to login:", err)
      setError(err instanceof Error ? err : new Error("ログインに失敗しました"))
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ログアウト
  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      await AuthService.logout()
      setUser(null)
      setIsAuthenticated(false)
    } catch (err) {
      console.error("Failed to logout:", err)
      setError(err instanceof Error ? err : new Error("ログアウトに失敗しました"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

// 後方互換性のために残しておく
export function useAuthContext() {
  return useAuth()
}
