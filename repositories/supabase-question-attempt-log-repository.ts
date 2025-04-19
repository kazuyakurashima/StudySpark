import type { QuestionAttemptLogRepository } from "./question-attempt-log-repository"
import type { QuestionAttemptLog } from "@/lib/generated/prisma"
import { getSupabaseClient } from "@/lib/supabase-client"
import type { SupabaseClient } from "@supabase/supabase-js"
import { startOfDay, endOfDay, format } from "date-fns"
import { PrismaClient } from "@/lib/generated/prisma"

/**
 * Supabaseを使用した問題学習状態記録リポジトリの実装
 * 効率的なクエリのために、インデックスを活用
 */
export class SupabaseQuestionAttemptLogRepository implements QuestionAttemptLogRepository {
  private supabase: SupabaseClient
  private prisma: PrismaClient
  private userId: string

  constructor(userId: string) {
    // Supabaseクライアントの初期化
    const client = getSupabaseClient()
    if (!client) {
      throw new Error("Supabase client initialization failed")
    }
    this.supabase = client
    this.prisma = new PrismaClient()
    this.userId = userId
  }

  /**
   * すべてのログを取得
   * 注意: データ量が多い場合はページネーションが必要
   */
  async findAll(): Promise<QuestionAttemptLog[]> {
    try {
      // Prismaを使用して最適化されたクエリを実行
      const logs = await this.prisma.questionAttemptLog.findMany({
        where: {
          userId: this.userId,
        },
        orderBy: {
          date: "desc",
        },
        include: {
          question: true,
        },
      })

      return logs
    } catch (error) {
      console.error("Error getting logs from database:", error)
      return []
    }
  }

  /**
   * IDでログを取得
   */
  async findById(id: string): Promise<QuestionAttemptLog | null> {
    try {
      const log = await this.prisma.questionAttemptLog.findUnique({
        where: {
          id,
        },
        include: {
          question: true,
        },
      })

      return log
    } catch (error) {
      console.error(`Error getting log ${id} from database:`, error)
      return null
    }
  }

  /**
   * 新しいログを作成
   */
  async create(data: Omit<QuestionAttemptLog, "id" | "updatedAt">): Promise<QuestionAttemptLog> {
    try {
      const newLog = await this.prisma.questionAttemptLog.create({
        data: {
          userId: this.userId,
          questionId: data.questionId,
          date: data.date,
          status: data.status,
          source: data.source,
        },
        include: {
          question: true,
        },
      })

      return newLog
    } catch (error) {
      console.error("Error creating log in database:", error)
      throw error
    }
  }

  /**
   * ログを更新
   */
  async update(id: string, data: Partial<QuestionAttemptLog>): Promise<QuestionAttemptLog> {
    try {
      const updatedLog = await this.prisma.questionAttemptLog.update({
        where: {
          id,
        },
        data: {
          status: data.status,
          date: data.date,
          source: data.source,
        },
        include: {
          question: true,
        },
      })

      return updatedLog
    } catch (error) {
      console.error(`Error updating log ${id} in database:`, error)
      throw error
    }
  }

  /**
   * ログを削除
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.questionAttemptLog.delete({
        where: {
          id,
        },
      })
    } catch (error) {
      console.error(`Error deleting log ${id} from database:`, error)
      throw error
    }
  }

  /**
   * 日付でログをフィルタリング
   * (user_id, date)のインデックスを活用
   */
  async findByDate(userId: string, date: Date): Promise<QuestionAttemptLog[]> {
    try {
      const start = startOfDay(date)
      const end = endOfDay(date)

      const logs = await this.prisma.questionAttemptLog.findMany({
        where: {
          userId,
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          question: true,
        },
        orderBy: {
          date: "asc",
        },
      })

      return logs
    } catch (error) {
      console.error("Error filtering logs by date:", error)
      return []
    }
  }

  /**
   * 日付範囲でログをフィルタリング
   * (user_id, date)のインデックスを活用
   */
  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<QuestionAttemptLog[]> {
    try {
      const start = startOfDay(startDate)
      const end = endOfDay(endDate)

      const logs = await this.prisma.questionAttemptLog.findMany({
        where: {
          userId,
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          question: true,
        },
        orderBy: {
          date: "asc",
        },
      })

      return logs
    } catch (error) {
      console.error("Error filtering logs by date range:", error)
      return []
    }
  }

  /**
   * ステータスでログをフィルタリング
   * (user_id, status)のインデックスを活用
   */
  async findByStatus(userId: string, status: string): Promise<QuestionAttemptLog[]> {
    try {
      const logs = await this.prisma.questionAttemptLog.findMany({
        where: {
          userId,
          status,
        },
        include: {
          question: true,
        },
        orderBy: {
          date: "desc",
        },
      })

      return logs
    } catch (error) {
      console.error("Error filtering logs by status:", error)
      return []
    }
  }

  /**
   * 質問IDでログをフィルタリング
   */
  async findByQuestionId(userId: string, questionId: string): Promise<QuestionAttemptLog[]> {
    try {
      const logs = await this.prisma.questionAttemptLog.findMany({
        where: {
          userId,
          questionId,
        },
        include: {
          question: true,
        },
        orderBy: {
          date: "desc",
        },
      })

      return logs
    } catch (error) {
      console.error("Error filtering logs by question ID:", error)
      return []
    }
  }

  /**
   * 質問IDと日付でログをフィルタリング
   * (question_id, date)のインデックスを活用
   */
  async findByQuestionIdAndDate(questionId: string, date: Date): Promise<QuestionAttemptLog[]> {
    try {
      const start = startOfDay(date)
      const end = endOfDay(date)

      const logs = await this.prisma.questionAttemptLog.findMany({
        where: {
          questionId,
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          question: true,
        },
        orderBy: {
          date: "asc",
        },
      })

      return logs
    } catch (error) {
      console.error("Error filtering logs by question ID and date:", error)
      return []
    }
  }

  /**
   * ユーザーの学習状況の統計情報を取得
   * (user_id, status)のインデックスを活用
   */
  async getStatistics(userId: string): Promise<{
    total: number
    completed: number
    partial: number
    incorrect: number
    pending: number
  }> {
    try {
      // 各ステータスごとのカウントを取得
      const statusCounts = await this.prisma.questionAttemptLog.groupBy({
        by: ["status"],
        where: {
          userId,
        },
        _count: {
          status: true,
        },
      })

      // 統計情報を初期化
      const statistics = {
        total: 0,
        completed: 0,
        partial: 0,
        incorrect: 0,
        pending: 0,
      }

      // グループごとに統計情報を更新
      statusCounts.forEach((statusCount) => {
        statistics.total += statusCount._count.status
        
        switch (statusCount.status) {
          case "completed":
            statistics.completed = statusCount._count.status
            break
          case "partial":
            statistics.partial = statusCount._count.status
            break
          case "incorrect":
            statistics.incorrect = statusCount._count.status
            break
          case "pending":
            statistics.pending = statusCount._count.status
            break
        }
      })

      return statistics
    } catch (error) {
      console.error("Error getting statistics:", error)
      return {
        total: 0,
        completed: 0,
        partial: 0,
        incorrect: 0,
        pending: 0,
      }
    }
  }

  /**
   * 日付ごとの学習状況の集計を取得
   * 期間が長い場合はバックグラウンドジョブで事前計算を検討
   */
  async getStatisticsByDate(userId: string, startDate: Date, endDate: Date): Promise<{
    date: Date
    total: number
    completed: number
  }[]> {
    try {
      const start = startOfDay(startDate)
      const end = endOfDay(endDate)

      // 日付とステータスでグループ化してカウント
      const dailyStats = await this.prisma.questionAttemptLog.groupBy({
        by: ["date", "status"],
        where: {
          userId,
          date: {
            gte: start,
            lte: end,
          },
        },
        _count: {
          status: true,
        },
        orderBy: {
          date: "asc",
        },
      })

      // 日付ごとの統計情報に変換
      const dateMap = new Map<string, { date: Date; total: number; completed: number }>()

      // 各日付の統計情報を初期化
      dailyStats.forEach((stat) => {
        const dateStr = format(stat.date, "yyyy-MM-dd")
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, {
            date: stat.date,
            total: 0,
            completed: 0,
          })
        }

        const dateStats = dateMap.get(dateStr)!
        dateStats.total += stat._count.status

        if (stat.status === "completed") {
          dateStats.completed = stat._count.status
        }
      })

      return Array.from(dateMap.values())
    } catch (error) {
      console.error("Error getting statistics by date:", error)
      return []
    }
  }
} 