import type { Repository } from "./base-repository"
import type { Task } from "@/types/models"

/**
 * タスクリポジトリのインターフェース
 * 基本的なCRUD操作に加えて、タスク固有の操作を定義
 */
export interface TaskRepository extends Repository<Task> {
  // 日付でタスクをフィルタリング
  findByDate(date: Date): Promise<Task[]>

  // 日付範囲でタスクをフィルタリング
  findByDateRange(startDate: Date, endDate: Date): Promise<Task[]>

  // ステータスでタスクをフィルタリング
  findByStatus(status: Task["status"]): Promise<Task[]>

  // 科目でタスクをフィルタリング
  findBySubject(subject: string): Promise<Task[]>

  // タグでタスクをフィルタリング
  findByTag(tag: string): Promise<Task[]>

  // タスクの統計情報を取得
  getStatistics(): Promise<{
    total: number
    completed: number
    partial: number
    incorrect: number
    pending: number
  }>
}
