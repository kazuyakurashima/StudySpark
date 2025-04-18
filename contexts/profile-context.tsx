"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { UserProfile, UserPreferences } from "@/types/user"
import * as ProfileService from "@/services/profile-service"

interface ProfileContextType {
  profile: UserProfile | null
  preferences: UserPreferences | null
  isLoading: boolean
  error: Error | null
  fetchProfile: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>
  setOnboardingCompleted: (completed: boolean) => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // プロフィールを取得
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      const fetchedProfile = await ProfileService.getUserProfile()
      setProfile(fetchedProfile)

      const fetchedPreferences = await ProfileService.getUserPreferences()
      setPreferences(fetchedPreferences)

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("プロフィールの取得に失敗しました"))
      console.error("Failed to fetch profile:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初期化時にプロフィールを読み込む
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // プロフィールを更新
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      try {
        setIsLoading(true)

        if (!profile) {
          throw new Error("Profile not found")
        }

        const updatedProfile = await ProfileService.updateUserProfile(updates)
        if (updatedProfile) {
          setProfile(updatedProfile)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("プロフィールの更新に失敗しました"))
        console.error("Failed to update profile:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [profile],
  )

  // 設定を更新
  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      try {
        setIsLoading(true)

        if (!preferences) {
          // 設定がない場合は新規作成
          const defaultPreferences: UserPreferences = {
            theme: "system",
            notifications: true,
            studyReminders: true,
            ...updates,
          }

          const savedPreferences = await ProfileService.saveUserPreferences(defaultPreferences)
          setPreferences(savedPreferences)
        } else {
          // 既存の設定を更新
          const updatedPreferences = await ProfileService.updateUserPreferences(updates)
          if (updatedPreferences) {
            setPreferences(updatedPreferences)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("設定の更新に失敗しました"))
        console.error("Failed to update preferences:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [preferences],
  )

  // オンボーディング完了状態を更新
  const setOnboardingCompletedImpl = useCallback(async (completed: boolean) => {
    try {
      setIsLoading(true)
      const updatedProfile = await ProfileService.setOnboardingCompleted(completed)
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("オンボーディング状態の更新に失敗しました"))
      console.error("Failed to set onboarding status:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <ProfileContext.Provider
      value={{
        profile,
        preferences,
        isLoading,
        error,
        fetchProfile,
        updateProfile,
        updatePreferences,
        setOnboardingCompleted: setOnboardingCompletedImpl,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfileContext() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfileContext must be used within a ProfileProvider")
  }
  return context
}
