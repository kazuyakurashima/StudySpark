import { defaultStorage } from "@/lib/storage-adapter"
import type { UserProfile, UserPreferences } from "@/types/user"

const USER_PROFILE_KEY = "user_profile"
const USER_PREFERENCES_KEY = "user_preferences"

// ユーザープロフィール取得
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    return await defaultStorage.getItem<UserProfile>(USER_PROFILE_KEY)
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

// ユーザープロフィール保存
export async function saveUserProfile(profile: UserProfile): Promise<UserProfile> {
  try {
    await defaultStorage.setItem(USER_PROFILE_KEY, profile)
    return profile
  } catch (error) {
    console.error("Error saving user profile:", error)
    throw error
  }
}

// ユーザープロフィール更新
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const currentProfile = await getUserProfile()
    if (!currentProfile) {
      throw new Error("User profile not found")
    }

    const updatedProfile = { ...currentProfile, ...updates, updatedAt: new Date() }
    await defaultStorage.setItem(USER_PROFILE_KEY, updatedProfile)
    return updatedProfile
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// ユーザー設定取得
export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    return await defaultStorage.getItem<UserPreferences>(USER_PREFERENCES_KEY)
  } catch (error) {
    console.error("Error getting user preferences:", error)
    return null
  }
}

// ユーザー設定保存
export async function saveUserPreferences(preferences: UserPreferences): Promise<UserPreferences> {
  try {
    await defaultStorage.setItem(USER_PREFERENCES_KEY, preferences)
    return preferences
  } catch (error) {
    console.error("Error saving user preferences:", error)
    throw error
  }
}

// ユーザー設定更新
export async function updateUserPreferences(updates: Partial<UserPreferences>): Promise<UserPreferences | null> {
  try {
    const currentPreferences = await getUserPreferences()
    if (!currentPreferences) {
      throw new Error("User preferences not found")
    }

    const updatedPreferences = { ...currentPreferences, ...updates }
    await defaultStorage.setItem(USER_PREFERENCES_KEY, updatedPreferences)
    return updatedPreferences
  } catch (error) {
    console.error("Error updating user preferences:", error)
    throw error
  }
}

// オンボーディング完了状態の更新
export async function setOnboardingCompleted(completed: boolean): Promise<UserProfile | null> {
  try {
    return await updateUserProfile({ onboardingCompleted: completed })
  } catch (error) {
    console.error("Error setting onboarding status:", error)
    throw error
  }
}
