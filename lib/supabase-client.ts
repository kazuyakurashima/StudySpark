import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// 環境変数からSupabase URLとAnon Keyを取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// シングルトンパターンを使用してクライアントインスタンスを管理
let supabaseInstance: SupabaseClient | null = null

/**
 * クライアント側で使用するSupabaseクライアントを取得
 * シングルトンパターンを使用して一度だけインスタンスを作成
 */
export const getSupabaseClient = () => {
  if (!supabaseInstance && typeof window !== "undefined") {
    // 環境変数が設定されているか確認
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase environment variables are not set")
      return null
    }

    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          storageKey: "studyspark-auth",
        },
      })
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      return null
    }
  }
  return supabaseInstance
}

/**
 * サーバーコンポーネントで使用するSupabaseクライアントを作成
 * 毎回新しいインスタンスを作成
 */
export const createServerSupabaseClient = () => {
  const serverSupabaseUrl = process.env.SUPABASE_URL || ""
  const serverSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!serverSupabaseUrl || !serverSupabaseKey) {
    console.error("Server Supabase environment variables are not set")
    return null
  }

  try {
    return createClient(serverSupabaseUrl, serverSupabaseKey, {
      auth: {
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("Failed to create server Supabase client:", error)
    return null
  }
}

/**
 * 認証済みユーザーのSupabaseクライアントを取得
 * @param accessToken ユーザーのアクセストークン
 */
export const getAuthenticatedSupabaseClient = (accessToken: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are not set")
    return null
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    })
  } catch (error) {
    console.error("Failed to create authenticated Supabase client:", error)
    return null
  }
}
