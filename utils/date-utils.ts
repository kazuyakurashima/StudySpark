import { format, isSameDay, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import type { Locale } from "date-fns"

/**
 * 日付文字列またはDate型の値を安全にDate型に変換する
 * 無効な値の場合はnullを返す
 */
export function toSafeDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null

  if (date instanceof Date) {
    // すでにDateオブジェクトの場合は、有効な日付かチェック
    if (isNaN(date.getTime())) {
      console.warn(`Invalid Date object: ${date}`)
      return null
    }
    return date
  }

  try {
    // ISO形式の文字列の場合はparseISOを使用
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(date)) {
      const parsedDate = parseISO(date)
      if (isNaN(parsedDate.getTime())) {
        console.warn(`Invalid ISO date string: ${date}`)
        return null
      }
      return parsedDate
    }

    // その他の文字列の場合はDateコンストラクタを使用
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      console.warn(`Invalid date string: ${date}`)
      return null
    }
    return parsedDate
  } catch (e) {
    console.error(`Error parsing date: ${date}`, e)
    return null
  }
}

/**
 * 日付が同じかどうかを比較する（時間は無視）
 */
export function isSameDate(date1: Date | string | null | undefined, date2: Date | string | null | undefined): boolean {
  const d1 = toSafeDate(date1)
  const d2 = toSafeDate(date2)

  if (!d1 || !d2) return false

  return isSameDay(d1, d2)
}

/**
 * 日付をフォーマットする
 * 無効な日付の場合は空文字列を返す
 */
export function formatDate(
  date: Date | string | null | undefined,
  formatStr = "yyyy-MM-dd",
  options?: { locale?: Locale },
): string {
  const safeDate = toSafeDate(date)
  if (!safeDate) return ""

  try {
    return format(safeDate, formatStr, { locale: options?.locale || ja })
  } catch (e) {
    console.error("Error formatting date:", e)
    return ""
  }
}

/**
 * 日本語の曜日を取得
 */
export function getJapaneseDayOfWeek(date: Date | string | null | undefined): string {
  const safeDate = toSafeDate(date)
  if (!safeDate) return ""

  try {
    return format(safeDate, "E", { locale: ja })
  } catch (e) {
    console.error("Error getting day of week:", e)
    return ""
  }
}

/**
 * 日付を比較する
 * date1 < date2 の場合は負の値
 * date1 > date2 の場合は正の値
 * date1 = date2 の場合は0
 */
export function compareDate(date1: Date | string | null | undefined, date2: Date | string | null | undefined): number {
  const d1 = toSafeDate(date1)
  const d2 = toSafeDate(date2)

  if (!d1 && !d2) return 0
  if (!d1) return -1
  if (!d2) return 1

  return d1.getTime() - d2.getTime()
}
