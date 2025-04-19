import type { Repository } from "./base-repository"
import type { QuestionAttemptLog } from "@/lib/generated/prisma"

/**
 * 問題の学習状態記録リポジトリのインターフェース
 * 基本的なCRUD操作に加えて、問題学習状態記録固有の操作を定義
 */
export interface QuestionAttemptLogRepository extends Repository<QuestionAttemptLog> {
  // 日付でログをフィルタリング
  findByDate(userId: string, date: Date): Promise<QuestionAttemptLog[]>

  // 日付範囲でログをフィルタリング
  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<QuestionAttemptLog[]>

  // ステータスでログをフィルタリング
  findByStatus(userId: string, status: string): Promise<QuestionAttemptLog[]>

  // 質問IDでログをフィルタリング
  findByQuestionId(userId: string, questionId: string): Promise<QuestionAttemptLog[]>

  // 質問IDと日付でログをフィルタリング
  findByQuestionIdAndDate(questionId: string, date: Date): Promise<QuestionAttemptLog[]>

  // ユーザーの学習状況の統計情報を取得
  getStatistics(userId: string): Promise<{
    total: number
    completed: number
    partial: number
    incorrect: number
    pending: number
  }>

  // 日付ごとの学習状況の集計を取得
  getStatisticsByDate(userId: string, startDate: Date, endDate: Date): Promise<{
    date: Date
    total: number
    completed: number
  }[]>
} 