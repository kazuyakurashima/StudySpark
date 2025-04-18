// 問題のレベルを定義
export type ProblemLevel = "basic" | "standard" | "advanced"

// 問題の型定義
export interface Problem {
  id: number
  level: ProblemLevel
  status: "complete" | "partial" | "incorrect" | null
  lastUpdated: string | null
}

// セクションの型定義
export interface Section {
  id: string
  title: string
  problems: Problem[]
}

// チャプターの型定義
export interface Chapter {
  id: number
  title: string
  sections: Section[]
}

// 体系問題集 数学Ⅰ 代数編のデータ
export const mathProblems: Chapter[] = [
  {
    id: 1,
    title: "第1章 正の数と負の数",
    sections: [
      {
        id: "1-1",
        title: "① 正の数と負の数",
        problems: [
          ...Array.from({ length: 11 }, (_, i) => ({
            id: i + 1,
            level: "basic" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
          ...Array.from({ length: 3 }, (_, i) => ({
            id: i + 12,
            level: "standard" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
        ],
      },
      {
        id: "1-2",
        title: "② 加法と減法",
        problems: [
          ...Array.from({ length: 11 }, (_, i) => ({
            id: i + 15,
            level: "basic" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
          ...Array.from({ length: 4 }, (_, i) => ({
            id: i + 26,
            level: "standard" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
        ],
      },
      {
        id: "1-3",
        title: "③ 乗法と除法",
        problems: [
          ...Array.from({ length: 10 }, (_, i) => ({
            id: i + 30,
            level: "basic" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
          ...Array.from({ length: 5 }, (_, i) => ({
            id: i + 40,
            level: "standard" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
        ],
      },
      {
        id: "1-4",
        title: "④ 四則の混じった計算",
        problems: [
          ...Array.from({ length: 13 }, (_, i) => ({
            id: i + 45,
            level: "basic" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
          ...Array.from({ length: 4 }, (_, i) => ({
            id: i + 58,
            level: "standard" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
        ],
      },
      {
        id: "1-5",
        title: "章末問題",
        problems: [
          ...Array.from({ length: 5 }, (_, i) => ({
            id: i + 1,
            level: "advanced" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
        ],
      },
    ],
  },
  {
    id: 2,
    title: "第2章 式の計算",
    sections: [
      {
        id: "2-1",
        title: "① 文字式",
        problems: [
          ...Array.from({ length: 11 }, (_, i) => ({
            id: i + 1,
            level: "basic" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
          ...Array.from({ length: 2 }, (_, i) => ({
            id: i + 12,
            level: "standard" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
        ],
      },
      {
        id: "2-2",
        title: "② 多項式の計算",
        problems: [
          ...Array.from({ length: 16 }, (_, i) => ({
            id: i + 14,
            level: "basic" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
          ...Array.from({ length: 4 }, (_, i) => ({
            id: i + 30,
            level: "standard" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
        ],
      },
      {
        id: "2-3",
        title: "③ 単項式の乗法と除法",
        problems: [
          ...Array.from({ length: 6 }, (_, i) => ({
            id: i + 34,
            level: "basic" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
          ...Array.from({ length: 2 }, (_, i) => ({
            id: i + 40,
            level: "standard" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
        ],
      },
      {
        id: "2-4",
        title: "④ 文字式の利用",
        problems: [
          ...Array.from({ length: 4 }, (_, i) => ({
            id: i + 42,
            level: "basic" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
          ...Array.from({ length: 3 }, (_, i) => ({
            id: i + 46,
            level: "standard" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
          {
            id: 49,
            level: "advanced" as ProblemLevel,
            status: null,
            lastUpdated: null,
          },
        ],
      },
      {
        id: "2-5",
        title: "章末問題",
        problems: [
          ...Array.from({ length: 5 }, (_, i) => ({
            id: i + 1,
            level: "advanced" as ProblemLevel,
            status: null,
            lastUpdated: null,
          })),
        ],
      },
    ],
  },
]

// 学習計画に基づいて問題を日付ごとに割り振る関数
export function generatePlannedTasks(
  problems: Chapter[],
  settings: {
    levels: { basic: boolean; standard: boolean; advanced: boolean }
    reviewPeriod: number
    reviewDays: { [key: string]: boolean }
    problemRange?: { unsolved: boolean; incorrect: boolean; partial: boolean; complete: boolean }
  },
) {
  // 現在の日付を取得
  const today = new Date()

  // テスト日を取得（ローカルストレージから）
  const savedStartDate = localStorage.getItem("startDate")
  let testDate = new Date()
  if (savedStartDate) {
    testDate = new Date(savedStartDate)
  } else {
    // デフォルトは1ヶ月後
    testDate.setMonth(testDate.getMonth() + 1)
  }

  // 学習期間を計算（テスト日から復習期間を引いた日数）
  const studyEndDate = new Date(testDate)
  studyEndDate.setDate(studyEndDate.getDate() - settings.reviewPeriod)

  // 今日からテスト前日までの日数
  const totalDays = Math.max(1, Math.floor((studyEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

  // 対象となる問題を抽出
  const targetProblems: { chapterId: number; sectionId: string; problem: Problem }[] = []

  problems.forEach((chapter) => {
    chapter.sections.forEach((section) => {
      section.problems.forEach((problem) => {
        // レベルに基づいてフィルタリング
        if (
          (problem.level === "basic" && settings.levels.basic) ||
          (problem.level === "standard" && settings.levels.standard) ||
          (problem.level === "advanced" && settings.levels.advanced)
        ) {
          // 問題範囲に基づいてフィルタリング（修正モードの場合）
          if (settings.problemRange) {
            if (
              (problem.status === null && settings.problemRange.unsolved) ||
              (problem.status === "incorrect" && settings.problemRange.incorrect) ||
              (problem.status === "partial" && settings.problemRange.partial) ||
              (problem.status === "complete" && settings.problemRange.complete)
            ) {
              targetProblems.push({
                chapterId: chapter.id,
                sectionId: section.id,
                problem: { ...problem },
              })
            }
          } else {
            // 新規作成モードの場合は全ての問題を対象に
            targetProblems.push({
              chapterId: chapter.id,
              sectionId: section.id,
              problem: { ...problem },
            })
          }
        }
      })
    })
  })

  // 復習日の曜日を取得
  const reviewDayNumbers: number[] = []
  if (settings.reviewDays.sunday) reviewDayNumbers.push(0)
  if (settings.reviewDays.monday) reviewDayNumbers.push(1)
  if (settings.reviewDays.tuesday) reviewDayNumbers.push(2)
  if (settings.reviewDays.wednesday) reviewDayNumbers.push(3)
  if (settings.reviewDays.thursday) reviewDayNumbers.push(4)
  if (settings.reviewDays.friday) reviewDayNumbers.push(5)
  if (settings.reviewDays.saturday) reviewDayNumbers.push(6)

  // 日付ごとの問題を割り振る
  const plannedTasks: {
    id: number
    date: string
    chapter: string
    section: string
    problems: Problem[]
  }[] = []

  // 1日あたりの問題数を計算
  const problemsPerDay = Math.ceil(targetProblems.length / totalDays)

  // 問題を日付ごとに割り振る
  let taskId = 1
  let problemIndex = 0

  for (let day = 0; day < totalDays; day++) {
    const currentDate = new Date(today)
    currentDate.setDate(currentDate.getDate() + day)

    // 復習日の場合はスキップ
    if (reviewDayNumbers.includes(currentDate.getDay())) {
      continue
    }

    // その日の問題を取得
    const dayProblems: Problem[] = []
    for (let i = 0; i < problemsPerDay && problemIndex < targetProblems.length; i++) {
      dayProblems.push(targetProblems[problemIndex].problem)
      problemIndex++
    }

    if (dayProblems.length > 0) {
      // 最初の問題のチャプターとセクションを取得
      const firstProblem = targetProblems[Math.max(0, problemIndex - dayProblems.length)]
      const chapter = problems.find((c) => c.id === firstProblem.chapterId)
      const section = chapter?.sections.find((s) => s.id === firstProblem.sectionId)

      plannedTasks.push({
        id: taskId++,
        date: format(currentDate),
        chapter: chapter?.title || "",
        section: section?.title || "",
        problems: dayProblems,
      })
    }
  }

  return plannedTasks
}

// 日付をフォーマットする関数
function format(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}
