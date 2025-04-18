import type { TaskRepository } from "./task-repository"
import type { Task } from "@/types/models"
import { getSupabaseClient } from "@/lib/supabase-client"
import type { SupabaseClient } from "@supabase/supabase-js"
import { startOfDay, endOfDay } from "date-fns"

/**
 * Supabaseを使用したタスクリポジトリの実装
 */
export class SupabaseTaskRepository implements TaskRepository {
  private supabase: SupabaseClient
  private userId: string

  constructor(userId: string) {
    // Supabaseクライアントの初期化 - getSupabaseClient関数を使用
    const client = getSupabaseClient()
    if (!client) {
      throw new Error("Supabase client initialization failed")
    }
    this.supabase = client
    this.userId = userId
  }

  /**
   * すべてのタスクを取得
   */
  async findAll(): Promise<Task[]> {
    try {
      // Supabaseクライアントが初期化されているか確認
      if (!this.supabase) {
        console.error("Supabase client is not initialized")
        return []
      }

      const { data, error } = await this.supabase
        .from("tasks")
        .select(`
          *,
          task_tags (*)
        `)
        .eq("user_id", this.userId)
        .order("due_date", { ascending: true })

      if (error) {
        console.error("Supabase query error:", error)
        throw error
      }

      if (!data) {
        return []
      }

      return data.map((task) => this.mapDbTaskToTask(task))
    } catch (error) {
      console.error("Error getting tasks from Supabase:", error)
      // エラーの詳細をログに出力
      if (error instanceof Error) {
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      }
      return []
    }
  }

  /**
   * IDでタスクを取得
   */
  async findById(id: string): Promise<Task | null> {
    try {
      const { data, error } = await this.supabase
        .from("tasks")
        .select(`
          *,
          task_tags (*)
        `)
        .eq("id", id)
        .eq("user_id", this.userId)
        .single()

      if (error) {
        if (error.code === "PGRST116") return null // PGRST116 = not found
        throw error
      }

      return data ? this.mapDbTaskToTask(data) : null
    } catch (error) {
      console.error(`Error getting task ${id} from Supabase:`, error)
      return null
    }
  }

  /**
   * 新しいタスクを作成
   */
  async create(data: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
    try {
      // タグを分離
      const { tags, ...taskData } = data as any

      // タスクを作成
      const { data: createdTask, error } = await this.supabase
        .from("tasks")
        .insert({
          user_id: this.userId,
          title: taskData.title,
          subject: taskData.subject,
          status: taskData.status,
          due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
          original_date: taskData.originalDate ? new Date(taskData.originalDate).toISOString() : null,
          description: taskData.description || null,
          priority: taskData.priority || null,
        })
        .select()
        .single()

      if (error) throw error

      // タグがある場合は追加
      if (tags && tags.length > 0 && createdTask.id) {
        const tagInserts = tags.map((tag: string) => ({
          task_id: createdTask.id,
          tag,
        }))

        const { error: tagError } = await this.supabase.from("task_tags").insert(tagInserts)

        if (tagError) throw tagError
      }

      // 作成したタスクを取得
      return this.findById(createdTask.id) as Promise<Task>
    } catch (error) {
      console.error("Error creating task in Supabase:", error)
      throw error
    }
  }

  /**
   * タスクを更新
   */
  async update(id: string, data: Partial<Task>): Promise<Task> {
    try {
      // タグを分離
      const { tags, ...taskData } = data as any

      // 更新データを準備
      const updateData: any = {}

      // 日付フィールドの処理
      if (taskData.dueDate !== undefined) {
        updateData.due_date = taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null
      }

      if (taskData.originalDate !== undefined) {
        updateData.original_date = taskData.originalDate ? new Date(taskData.originalDate).toISOString() : null
      }

      // その他のフィールドの処理
      if (taskData.title !== undefined) updateData.title = taskData.title
      if (taskData.subject !== undefined) updateData.subject = taskData.subject
      if (taskData.status !== undefined) updateData.status = taskData.status
      if (taskData.description !== undefined) updateData.description = taskData.description
      if (taskData.priority !== undefined) updateData.priority = taskData.priority

      // タスクを更新
      const { error } = await this.supabase.from("tasks").update(updateData).eq("id", id).eq("user_id", this.userId)

      if (error) throw error

      // タグを更新（一度削除して再追加）
      if (tags !== undefined) {
        // 既存のタグを削除
        const { error: deleteError } = await this.supabase.from("task_tags").delete().eq("task_id", id)

        if (deleteError) throw deleteError

        // 新しいタグを追加
        if (tags && tags.length > 0) {
          const tagInserts = tags.map((tag: string) => ({
            task_id: id,
            tag,
          }))

          const { error: tagError } = await this.supabase.from("task_tags").insert(tagInserts)

          if (tagError) throw tagError
        }
      }

      // 更新したタスクを取得
      return this.findById(id) as Promise<Task>
    } catch (error) {
      console.error(`Error updating task ${id} in Supabase:`, error)
      throw error
    }
  }

  /**
   * タスクを削除
   */
  async delete(id: string): Promise<void> {
    try {
      // タスクを削除（外部キー制約によりタグも自動的に削除される）
      const { error } = await this.supabase.from("tasks").delete().eq("id", id).eq("user_id", this.userId)

      if (error) throw error
    } catch (error) {
      console.error(`Error deleting task ${id} from Supabase:`, error)
      throw error
    }
  }

  /**
   * 日付でタスクをフィルタリング
   */
  async findByDate(date: Date): Promise<Task[]> {
    try {
      const start = startOfDay(date).toISOString()
      const end = endOfDay(date).toISOString()

      const { data, error } = await this.supabase
        .from("tasks")
        .select(`
          *,
          task_tags (*)
        `)
        .eq("user_id", this.userId)
        .gte("due_date", start)
        .lte("due_date", end)

      if (error) throw error

      return data.map(this.mapDbTaskToTask)
    } catch (error) {
      console.error("Error filtering tasks by date:", error)
      return []
    }
  }

  /**
   * 日付範囲でタスクをフィルタリング
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    try {
      const start = startOfDay(startDate).toISOString()
      const end = endOfDay(endDate).toISOString()

      const { data, error } = await this.supabase
        .from("tasks")
        .select(`
          *,
          task_tags (*)
        `)
        .eq("user_id", this.userId)
        .gte("due_date", start)
        .lte("due_date", end)

      if (error) throw error

      return data.map(this.mapDbTaskToTask)
    } catch (error) {
      console.error("Error filtering tasks by date range:", error)
      return []
    }
  }

  /**
   * ステータスでタスクをフィルタリング
   */
  async findByStatus(status: Task["status"]): Promise<Task[]> {
    try {
      const { data, error } = await this.supabase
        .from("tasks")
        .select(`
          *,
          task_tags (*)
        `)
        .eq("user_id", this.userId)
        .eq("status", status)

      if (error) throw error

      return data.map(this.mapDbTaskToTask)
    } catch (error) {
      console.error("Error filtering tasks by status:", error)
      return []
    }
  }

  /**
   * 科目でタスクをフィルタリング
   */
  async findBySubject(subject: string): Promise<Task[]> {
    try {
      const { data, error } = await this.supabase
        .from("tasks")
        .select(`
          *,
          task_tags (*)
        `)
        .eq("user_id", this.userId)
        .eq("subject", subject)

      if (error) throw error

      return data.map(this.mapDbTaskToTask)
    } catch (error) {
      console.error("Error filtering tasks by subject:", error)
      return []
    }
  }

  /**
   * タグでタスクをフィルタリング
   */
  async findByTag(tag: string): Promise<Task[]> {
    try {
      const { data, error } = await this.supabase
        .from("tasks")
        .select(`
          *,
          task_tags!inner (*)
        `)
        .eq("user_id", this.userId)
        .eq("task_tags.tag", tag)

      if (error) throw error

      return data.map(this.mapDbTaskToTask)
    } catch (error) {
      console.error("Error filtering tasks by tag:", error)
      return []
    }
  }

  /**
   * タスクの統計情報を取得
   */
  async getStatistics(): Promise<{
    total: number
    completed: number
    partial: number
    incorrect: number
    pending: number
  }> {
    try {
      const { data, error } = await this.supabase.from("tasks").select("status").eq("user_id", this.userId)

      if (error) throw error

      return {
        total: data.length,
        completed: data.filter((task) => task.status === "complete").length,
        partial: data.filter((task) => task.status === "partial").length,
        incorrect: data.filter((task) => task.status === "incorrect").length,
        pending: data.filter((task) => task.status === null).length,
      }
    } catch (error) {
      console.error("Error getting task statistics:", error)
      return { total: 0, completed: 0, partial: 0, incorrect: 0, pending: 0 }
    }
  }

  /**
   * DBのタスクデータをアプリケーションモデルに変換
   */
  private mapDbTaskToTask(dbTask: any): Task {
    try {
      // タグを配列に変換
      const tags = dbTask.task_tags ? dbTask.task_tags.map((tag: any) => tag.tag) : []

      return {
        id: dbTask.id,
        userId: dbTask.user_id,
        title: dbTask.title,
        subject: dbTask.subject,
        status: dbTask.status,
        dueDate: dbTask.due_date ? new Date(dbTask.due_date) : undefined,
        originalDate: dbTask.original_date ? new Date(dbTask.original_date) : undefined,
        description: dbTask.description || undefined,
        priority: dbTask.priority || undefined,
        tags,
        createdAt: new Date(dbTask.created_at),
        updatedAt: new Date(dbTask.updated_at),
      }
    } catch (error) {
      console.error("Error mapping DB task to app task:", error)
      throw error
    }
  }
}
