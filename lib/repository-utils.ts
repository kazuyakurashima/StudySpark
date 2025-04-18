import { RepositoryFactory } from "@/repositories/base-repository"
import type { TaskRepository } from "@/repositories/task-repository"
import { LocalStorageTaskRepository } from "@/repositories/local-storage-task-repository"
import { SupabaseTaskRepository } from "@/repositories/supabase-task-repository"

// 機能フラグ - 一時的にSupabaseを無効化
export const FeatureFlags = {
  // 環境変数がtrueでも、一時的にfalseに設定して強制的にローカルストレージを使用
  USE_SUPABASE: false, // process.env.NEXT_PUBLIC_USE_SUPABASE === "true",
}

/**
 * タスクリポジトリを取得
 * 環境変数に基づいて適切なリポジトリを返す
 */
export function getTaskRepository(userId?: string): TaskRepository {
  // リポジトリが登録されていない場合は登録
  if (!RepositoryFactory.has("task")) {
    if (FeatureFlags.USE_SUPABASE && userId) {
      try {
        RepositoryFactory.register("task", new SupabaseTaskRepository(userId))
      } catch (error) {
        console.error("Failed to initialize Supabase repository, falling back to localStorage:", error)
        RepositoryFactory.register("task", new LocalStorageTaskRepository())
      }
    } else {
      RepositoryFactory.register("task", new LocalStorageTaskRepository())
    }
  }

  return RepositoryFactory.get<TaskRepository>("task")
}

/**
 * リポジトリを初期化
 * アプリケーション起動時に呼び出す
 */
export function initializeRepositories(userId?: string): void {
  if (FeatureFlags.USE_SUPABASE && userId) {
    try {
      RepositoryFactory.register("task", new SupabaseTaskRepository(userId))
    } catch (error) {
      console.error("Failed to initialize Supabase repository, falling back to localStorage:", error)
      RepositoryFactory.register("task", new LocalStorageTaskRepository())
    }
  } else {
    RepositoryFactory.register("task", new LocalStorageTaskRepository())
  }
}
