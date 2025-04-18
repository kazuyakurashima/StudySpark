// ストレージアダプターのインターフェース
export interface StorageAdapter {
  getItem<T>(key: string): Promise<T | null>
  setItem<T>(key: string, value: T): Promise<void>
  removeItem(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}

// ローカルストレージアダプター
export class LocalStorageAdapter implements StorageAdapter {
  async getItem<T>(key: string): Promise<T | null> {
    if (typeof window === "undefined") return null

    try {
      const item = localStorage.getItem(key)
      if (!item) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error)
      return null
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting item in localStorage: ${key}`, error)
    }
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error)
    }
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") return

    try {
      localStorage.clear()
    } catch (error) {
      console.error("Error clearing localStorage", error)
    }
  }

  async keys(): Promise<string[]> {
    if (typeof window === "undefined") return []

    try {
      return Object.keys(localStorage)
    } catch (error) {
      console.error("Error getting keys from localStorage", error)
      return []
    }
  }
}

// Supabaseアダプター
import type { SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseClient } from "./supabase-client"

export class SupabaseAdapter implements StorageAdapter {
  private supabaseClient: SupabaseClient
  private tableName: string
  private keyColumn: string
  private valueColumn: string
  private userIdColumn: string
  private userId: string | null

  constructor(
    supabaseClient: SupabaseClient,
    options: {
      tableName: string
      keyColumn?: string
      valueColumn?: string
      userIdColumn?: string
      userId?: string | null
    },
  ) {
    this.supabaseClient = supabaseClient
    this.tableName = options.tableName
    this.keyColumn = options.keyColumn || "key"
    this.valueColumn = options.valueColumn || "value"
    this.userIdColumn = options.userIdColumn || "user_id"
    this.userId = options.userId || null
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const query = this.supabaseClient.from(this.tableName).select(this.valueColumn).eq(this.keyColumn, key)

      // ユーザーIDが指定されている場合は、そのユーザーのデータのみを取得
      if (this.userId) {
        query.eq(this.userIdColumn, this.userId)
      }

      const { data, error } = await query.single()

      if (error) {
        console.error(`Error getting item from Supabase: ${key}`, error)
        return null
      }

      if (!data) return null
      return JSON.parse(data[this.valueColumn]) as T
    } catch (error) {
      console.error(`Error getting item from Supabase: ${key}`, error)
      return null
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const item = {
        [this.keyColumn]: key,
        [this.valueColumn]: JSON.stringify(value),
      }

      // ユーザーIDが指定されている場合は、そのユーザーのデータとして保存
      if (this.userId) {
        item[this.userIdColumn] = this.userId
      }

      const { error } = await this.supabaseClient.from(this.tableName).upsert(item, { onConflict: this.keyColumn })

      if (error) {
        console.error(`Error setting item in Supabase: ${key}`, error)
      }
    } catch (error) {
      console.error(`Error setting item in Supabase: ${key}`, error)
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const query = this.supabaseClient.from(this.tableName).delete().eq(this.keyColumn, key)

      // ユーザーIDが指定されている場合は、そのユーザーのデータのみを削除
      if (this.userId) {
        query.eq(this.userIdColumn, this.userId)
      }

      const { error } = await query

      if (error) {
        console.error(`Error removing item from Supabase: ${key}`, error)
      }
    } catch (error) {
      console.error(`Error removing item from Supabase: ${key}`, error)
    }
  }

  async clear(): Promise<void> {
    try {
      let query = this.supabaseClient.from(this.tableName).delete()

      // ユーザーIDが指定されている場合は、そのユーザーのデータのみを削除
      if (this.userId) {
        query = query.eq(this.userIdColumn, this.userId)
      }

      const { error } = await query

      if (error) {
        console.error("Error clearing Supabase table", error)
      }
    } catch (error) {
      console.error("Error clearing Supabase table", error)
    }
  }

  async keys(): Promise<string[]> {
    try {
      let query = this.supabaseClient.from(this.tableName).select(this.keyColumn)

      // ユーザーIDが指定されている場合は、そのユーザーのデータのみを取得
      if (this.userId) {
        query = query.eq(this.userIdColumn, this.userId)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error getting keys from Supabase", error)
        return []
      }

      return data.map((item) => item[this.keyColumn])
    } catch (error) {
      console.error("Error getting keys from Supabase", error)
      return []
    }
  }
}

// タスク専用のSupabaseアダプター
export class TaskSupabaseAdapter {
  private supabaseClient: SupabaseClient
  private userId: string | null

  constructor(supabaseClient: SupabaseClient, userId: string | null = null) {
    this.supabaseClient = supabaseClient
    this.userId = userId
  }

  // タスク一覧を取得
  async getTasks() {
    if (!this.userId) {
      throw new Error("User ID is required to get tasks")
    }

    const { data, error } = await this.supabaseClient
      .from("tasks")
      .select(`
        *,
        task_tags(tag)
      `)
      .eq("user_id", this.userId)
      .order("due_date", { ascending: true })

    if (error) {
      console.error("Error getting tasks from Supabase", error)
      throw error
    }

    // タスクデータを変換
    return data.map((task) => this.mapDbTaskToAppTask(task))
  }

  // タスクを追加
  async addTask(task: any) {
    if (!this.userId) {
      throw new Error("User ID is required to add a task")
    }

    // タグを分離
    const { tags, ...taskData } = task

    // スネークケースに変換
    const dbTask = {
      user_id: this.userId,
      title: taskData.title,
      subject: taskData.subject,
      status: taskData.status,
      due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
      original_date: taskData.originalDate ? new Date(taskData.originalDate).toISOString() : null,
      description: taskData.description || null,
      priority: taskData.priority || null,
    }

    // タスクを追加
    const { data, error } = await this.supabaseClient.from("tasks").insert(dbTask).select().single()

    if (error) {
      console.error("Error adding task to Supabase", error)
      throw error
    }

    // タグがある場合は追加
    if (tags && tags.length > 0 && data.id) {
      const tagInserts = tags.map((tag) => ({
        task_id: data.id,
        tag,
      }))

      const { error: tagError } = await this.supabaseClient.from("task_tags").insert(tagInserts)

      if (tagError) {
        console.error("Error adding task tags to Supabase", tagError)
      }
    }

    return this.mapDbTaskToAppTask({ ...data, task_tags: tags ? tags.map((tag) => ({ tag })) : [] })
  }

  // タスクを更新
  async updateTask(task: any) {
    if (!this.userId) {
      throw new Error("User ID is required to update a task")
    }

    // タグを分離
    const { tags, id, ...taskData } = task

    // スネークケースに変換
    const dbTask = {
      title: taskData.title,
      subject: taskData.subject,
      status: taskData.status,
      due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
      original_date: taskData.originalDate ? new Date(taskData.originalDate).toISOString() : null,
      description: taskData.description || null,
      priority: taskData.priority || null,
      updated_at: new Date().toISOString(),
    }

    // タスクを更新
    const { error } = await this.supabaseClient.from("tasks").update(dbTask).eq("id", id).eq("user_id", this.userId)

    if (error) {
      console.error("Error updating task in Supabase", error)
      throw error
    }

    // タグを更新（一度削除して再追加）
    if (tags !== undefined) {
      // 既存のタグを削除
      const { error: deleteError } = await this.supabaseClient.from("task_tags").delete().eq("task_id", id)

      if (deleteError) {
        console.error("Error deleting task tags from Supabase", deleteError)
      }

      // 新しいタグを追加
      if (tags && tags.length > 0) {
        const tagInserts = tags.map((tag) => ({
          task_id: id,
          tag,
        }))

        const { error: tagError } = await this.supabaseClient.from("task_tags").insert(tagInserts)

        if (tagError) {
          console.error("Error adding task tags to Supabase", tagError)
        }
      }
    }

    // 更新後のタスクを取得
    const { data: updatedTask, error: fetchError } = await this.supabaseClient
      .from("tasks")
      .select(`
        *,
        task_tags(tag)
      `)
      .eq("id", id)
      .eq("user_id", this.userId)
      .single()

    if (fetchError) {
      console.error("Error fetching updated task from Supabase", fetchError)
      throw fetchError
    }

    return this.mapDbTaskToAppTask(updatedTask)
  }

  // タスクを削除
  async deleteTask(taskId: string) {
    if (!this.userId) {
      throw new Error("User ID is required to delete a task")
    }

    const { error } = await this.supabaseClient.from("tasks").delete().eq("id", taskId).eq("user_id", this.userId)

    if (error) {
      console.error("Error deleting task from Supabase", error)
      throw error
    }
  }

  // 日付でタスクをフィルタリング
  async getTasksByDate(date: Date) {
    if (!this.userId) {
      throw new Error("User ID is required to get tasks by date")
    }

    // 日付の範囲を設定（指定日の0時から23時59分59秒まで）
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    const { data, error } = await this.supabaseClient
      .from("tasks")
      .select(`
        *,
        task_tags(tag)
      `)
      .eq("user_id", this.userId)
      .gte("due_date", startDate.toISOString())
      .lte("due_date", endDate.toISOString())

    if (error) {
      console.error("Error getting tasks by date from Supabase", error)
      throw error
    }

    return data.map((task) => this.mapDbTaskToAppTask(task))
  }

  // タスクをフィルタリング
  async filterTasks(filter: any) {
    if (!this.userId) {
      throw new Error("User ID is required to filter tasks")
    }

    let query = this.supabaseClient
      .from("tasks")
      .select(`
        *,
        task_tags(tag)
      `)
      .eq("user_id", this.userId)

    // 科目フィルター
    if (filter.subject) {
      query = query.eq("subject", filter.subject)
    }

    // ステータスフィルター
    if (filter.status !== undefined) {
      query = query.eq("status", filter.status)
    }

    // 日付範囲フィルター
    if (filter.dateRange) {
      if (filter.dateRange.start) {
        query = query.gte("due_date", new Date(filter.dateRange.start).toISOString())
      }
      if (filter.dateRange.end) {
        query = query.lte("due_date", new Date(filter.dateRange.end).toISOString())
      }
    }

    const { data, error } = await query

    if (error) {
      console.error("Error filtering tasks from Supabase", error)
      throw error
    }

    // タグフィルターは後処理で行う（Supabaseでは配列の一部一致が難しいため）
    let filteredTasks = data.map((task) => this.mapDbTaskToAppTask(task))

    if (filter.tags && filter.tags.length > 0) {
      filteredTasks = filteredTasks.filter((task) => {
        if (!task.tags || task.tags.length === 0) return false
        return filter.tags.some((tag: string) => task.tags?.includes(tag))
      })
    }

    return filteredTasks
  }

  // タスク統計情報を取得
  async getTaskStats() {
    if (!this.userId) {
      throw new Error("User ID is required to get task stats")
    }

    const { data, error } = await this.supabaseClient.from("tasks").select("status").eq("user_id", this.userId)

    if (error) {
      console.error("Error getting task stats from Supabase", error)
      throw error
    }

    const stats = {
      total: data.length,
      completed: data.filter((task) => task.status === "complete").length,
      partial: data.filter((task) => task.status === "partial").length,
      incorrect: data.filter((task) => task.status === "incorrect").length,
      pending: data.filter((task) => task.status === null).length,
    }

    return stats
  }

  // DBのタスクデータをアプリ用に変換
  private mapDbTaskToAppTask(dbTask: any) {
    // タグを配列に変換
    const tags = dbTask.task_tags ? dbTask.task_tags.map((tag: any) => tag.tag) : []

    return {
      id: dbTask.id,
      title: dbTask.title,
      subject: dbTask.subject,
      status: dbTask.status,
      dueDate: dbTask.due_date ? new Date(dbTask.due_date) : null,
      originalDate: dbTask.original_date ? new Date(dbTask.original_date) : null,
      description: dbTask.description,
      priority: dbTask.priority,
      tags: tags,
    }
  }
}

// ストレージアダプターのファクトリー
export const createStorageAdapter = (
  type: "local" | "supabase",
  options?: {
    supabaseClient?: any
    tableName?: string
    userId?: string | null
  },
): StorageAdapter => {
  switch (type) {
    case "local":
      return new LocalStorageAdapter()
    case "supabase":
      if (!options?.supabaseClient) {
        const client = getSupabaseClient()
        if (!client) {
          throw new Error("Supabase client is required for Supabase adapter")
        }
        options = { ...options, supabaseClient: client }
      }
      return new SupabaseAdapter(options.supabaseClient, {
        tableName: options.tableName || "storage",
        userId: options.userId,
      })
    default:
      return new LocalStorageAdapter()
  }
}

// デフォルトのストレージアダプター
export const defaultStorage = createStorageAdapter("local")
