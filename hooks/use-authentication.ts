"use client"

import { useCallback, useEffect } from "react"
import { useAuthContext } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"

interface UseAuthenticationOptions {
  redirectTo?: string
  redirectIfAuthenticated?: string
}

export function useAuthentication(options: UseAuthenticationOptions = {}) {
  const { isAuthenticated, isLoading, user, checkAuth } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()

  // 認証状態に基づいてリダイレクト
  useEffect(() => {
    if (isLoading) return

    // 未認証の場合、指定されたパスにリダイレクト
    if (!isAuthenticated && options.redirectTo && pathname !== options.redirectTo) {
      router.push(options.redirectTo)
    }

    // 認証済みの場合、指定されたパスにリダイレクト
    if (isAuthenticated && options.redirectIfAuthenticated && pathname !== options.redirectIfAuthenticated) {
      router.push(options.redirectIfAuthenticated)
    }
  }, [isAuthenticated, isLoading, router, pathname, options.redirectTo, options.redirectIfAuthenticated])

  // 認証状態を再確認
  const refreshAuth = useCallback(async () => {
    return await checkAuth()
  }, [checkAuth])

  return {
    isAuthenticated,
    isLoading,
    user,
    refreshAuth,
  }
}
