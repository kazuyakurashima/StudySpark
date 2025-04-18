"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookOpen, ChevronRight, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// 問題データ構成
const mathChapters = [
  {
    id: 1,
    title: "第1章 正の数と負の数",
    sections: [
      { id: "1-1", title: "① 正の数と負の数", pages: "4-6", problems: "1-14" },
      { id: "1-2", title: "② 加法と減法", pages: "7-9", problems: "15-29" },
      { id: "1-3", title: "③ 乗法と除法", pages: "10-12", problems: "30-44" },
      { id: "1-4", title: "④ 四則の混じった計算", pages: "13-16", problems: "45-61" },
      { id: "1-5", title: "章末問題", pages: "17", problems: "1-5" },
    ],
  },
  {
    id: 2,
    title: "第2章 式の計算",
    sections: [
      { id: "2-1", title: "① 文字式", pages: "18-20", problems: "1-13" },
      { id: "2-2", title: "② 多項式の計算", pages: "21-24", problems: "14-33" },
      { id: "2-3", title: "③ 単項式の乗法と除法", pages: "25-26", problems: "34-41" },
      { id: "2-4", title: "④ 文字式の利用", pages: "27-28", problems: "42-49" },
      { id: "2-5", title: "章末問題", pages: "29", problems: "1-5" },
    ],
  },
  {
    id: 3,
    title: "第3章 方程式",
    sections: [
      { id: "3-1", title: "① 方程式とその解 / ② １次方程式の解き方", pages: "30-33", problems: "1-14" },
      { id: "3-2", title: "③ 1次方程式の利用", pages: "34-39", problems: "15-36" },
      { id: "3-3", title: "④ 連立方程式", pages: "40-43", problems: "37-49" },
      { id: "3-4", title: "⑤ 連立方程式の利用", pages: "44-48", problems: "50-63" },
      { id: "3-5", title: "章末問題", pages: "49", problems: "1-6" },
    ],
  },
  {
    id: 4,
    title: "第4章 不等式",
    sections: [
      { id: "4-1", title: "① 不等式の性質 / ② 不等式の解き方", pages: "50-53", problems: "1-18" },
      { id: "4-2", title: "③ 不等式の利用", pages: "54-58", problems: "19-33" },
      { id: "4-3", title: "④ 連立不等式", pages: "59-64", problems: "34-51" },
      { id: "4-4", title: "章末問題", pages: "65", problems: "1-6" },
    ],
  },
  {
    id: 5,
    title: "第5章 1次関数",
    sections: [
      { id: "5-1", title: "① 変化と関数", pages: "66", problems: "1-2" },
      { id: "5-2", title: "② 比例とそのグラフ", pages: "67-71", problems: "3-20" },
      { id: "5-3", title: "③ 反比例とそのグラフ", pages: "72-75", problems: "21-33" },
      { id: "5-4", title: "④ 比例,反比例の利用", pages: "76-77", problems: "34-38" },
      { id: "5-5", title: "⑤ 1次関数とそのグラフ", pages: "78-84", problems: "39-63" },
      { id: "5-6", title: "⑥ 1次関数と方程式", pages: "85-87", problems: "64-72" },
      { id: "5-7", title: "⑦ 1次関数の利用", pages: "88-94", problems: "73-92" },
      { id: "5-8", title: "章末問題", pages: "95", problems: "1-5" },
    ],
  },
]

type RangeSelectionStep = "start" | "end" | "confirm"

export function RangeSelection() {
  const [step, setStep] = useState<RangeSelectionStep>("start")
  const [startChapter, setStartChapter] = useState<number | null>(null)
  const [startSection, setStartSection] = useState<string | null>(null)
  const [endChapter, setEndChapter] = useState<number | null>(null)
  const [endSection, setEndSection] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showOrderWarning, setShowOrderWarning] = useState(false)
  const router = useRouter()

  const handleStartChapterSelect = (chapterId: number) => {
    setStartChapter(chapterId)
  }

  const handleStartSectionSelect = (sectionId: string) => {
    setStartSection(sectionId)
    setStep("end")
  }

  const handleEndChapterSelect = (chapterId: number) => {
    setEndChapter(chapterId)
  }

  const handleEndSectionSelect = (sectionId: string) => {
    // 開始セクションと終了セクションの順序をチェック
    if (startChapter && startSection) {
      const startChapterObj = getChapterById(startChapter)
      const startSectionObj = getSectionById(startChapter, startSection)
      const endChapterObj = getChapterById(endChapter)
      const endSectionObj = getSectionById(endChapter, sectionId)

      if (startChapterObj && startSectionObj && endChapterObj && endSectionObj) {
        // 章が同じ場合はセクションの順序をチェック
        if (startChapter === endChapter) {
          const startSectionIndex = startChapterObj.sections.findIndex((s) => s.id === startSection)
          const endSectionIndex = endChapterObj.sections.findIndex((s) => s.id === sectionId)

          if (endSectionIndex < startSectionIndex) {
            // 終了セクションが開始セクションより前の場合は警告を表示
            setShowOrderWarning(true)
            return
          }
        }
        // 章が異なる場合は章の順序をチェック
        else if (endChapter && endChapter < startChapter) {
          // 終了章が開始章より前の場合は警告を表示
          setShowOrderWarning(true)
          return
        }
      }
    }

    setEndSection(sectionId)
    setStep("confirm")
  }

  const handleConfirmClick = () => {
    // 確認ダイアログを表示
    setShowConfirmDialog(true)
  }

  const handleConfirm = () => {
    // 試験範囲の情報を保存
    if (startChapter && startSection && endChapter && endSection) {
      // 試験範囲の情報をローカルストレージに保存
      localStorage.setItem("study_range_start_chapter", startChapter.toString())
      localStorage.setItem("study_range_start_section", startSection)
      localStorage.setItem("study_range_end_chapter", endChapter.toString())
      localStorage.setItem("study_range_end_section", endSection)

      // ゴール設定完了フラグを設定
      localStorage.setItem("goal_setup_completed", "true")

      // スパークへの直接遷移フラグを設定
      localStorage.setItem("direct_to_spark_tasks", "true")

      // 学習計画をリセット
      localStorage.removeItem("has_study_plan")

      // スパークリストのデータをクリア
      localStorage.removeItem("spark_task_data")

      // モックデータを生成
      generateMockData()
    }

    // スパークページに遷移
    router.push("/spark?showPlanCreator=true")
  }

  // モックデータを生成する関数
  const generateMockData = () => {
    try {
      // モックデータを生成
      const mockData = [
        {
          id: 1,
          chapter: "第1章 正の数と負の数",
          section: "③ 乗法と除法",
          color: "blue",
          problems: Array.from({ length: 15 }, (_, i) => ({
            id: i + 30,
            status: null,
            lastUpdated: null,
          })),
        },
        {
          id: 2,
          chapter: "第1章 正の数と負の数",
          section: "④ 四則の混じった計算",
          color: "green",
          problems: Array.from({ length: 6 }, (_, i) => ({
            id: i + 45,
            status: null,
            lastUpdated: null,
          })),
        },
        {
          id: 3,
          chapter: "第2章 式の計算",
          section: "① 文字式",
          color: "purple",
          problems: Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            status: null,
            lastUpdated: null,
          })),
        },
      ]

      // ローカルストレージに保存
      localStorage.setItem("spark_task_data", JSON.stringify(mockData))
    } catch (err) {
      console.error("Error generating mock data:", err)
    }
  }

  const handleReset = () => {
    setStartChapter(null)
    setStartSection(null)
    setEndChapter(null)
    setEndSection(null)
    setStep("start")
  }

  const getChapterById = (id: number | null) => {
    if (id === null) return null
    return mathChapters.find((chapter) => chapter.id === id)
  }

  const getSectionById = (chapterId: number | null, sectionId: string | null) => {
    if (chapterId === null || sectionId === null) return null
    const chapter = getChapterById(chapterId)
    if (!chapter) return null
    return chapter.sections.find((section) => section.id === sectionId)
  }

  const startChapterObj = getChapterById(startChapter)
  const startSectionObj = getSectionById(startChapter, startSection)
  const endChapterObj = getChapterById(endChapter)
  const endSectionObj = getSectionById(endChapter, endSection)

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center">試験範囲を決定</CardTitle>
          <CardDescription className="text-center">
            {step === "start" && "試験範囲の開始位置を選択してください"}
            {step === "end" && "試験範囲の終了位置を選択してください"}
            {step === "confirm" && "以下の試験範囲で正しいですか？"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 試験範囲の選択状態を常に表示 */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium mb-2 text-blue-800">試験範囲</h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="font-medium">試験範囲（はじめ）</div>
                {startChapterObj && startSectionObj ? (
                  <div className="mt-1 p-2 bg-white rounded border border-blue-300 relative">
                    <div className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      1
                    </div>
                    <p className="font-medium">{startChapterObj.title}</p>
                    <p className="text-sm text-gray-600">{startSectionObj.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      P.{startSectionObj.pages} / 問{startSectionObj.problems}
                    </p>
                  </div>
                ) : (
                  <div className="mt-1 p-2 bg-gray-100 rounded border border-gray-300 text-gray-500 italic">未選択</div>
                )}
              </div>

              <ArrowRight className="mx-4 h-6 w-6 text-blue-500 flex-shrink-0" />

              <div className="flex-1">
                <div className="font-medium">試験範囲（終わり）</div>
                {endChapterObj && endSectionObj ? (
                  <div className="mt-1 p-2 bg-white rounded border border-blue-300 relative">
                    <div className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      2
                    </div>
                    <p className="font-medium">{endChapterObj.title}</p>
                    <p className="text-sm text-gray-600">{endSectionObj.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      P.{endSectionObj.pages} / 問{endSectionObj.problems}
                    </p>
                  </div>
                ) : (
                  <div className="mt-1 p-2 bg-gray-100 rounded border border-gray-300 text-gray-500 italic">未選択</div>
                )}
              </div>
            </div>
          </div>

          {step === "start" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-center mb-4 text-blue-700">
                <span className="inline-flex items-center justify-center bg-blue-700 text-white rounded-full w-6 h-6 mr-2">
                  1
                </span>
                試験範囲（はじめ）を選択
              </h3>

              <Accordion type="single" collapsible className="w-full">
                {mathChapters.map((chapter) => (
                  <AccordionItem
                    key={chapter.id}
                    value={`chapter-${chapter.id}`}
                    className="border border-gray-200 rounded-lg mb-2 overflow-hidden"
                  >
                    <AccordionTrigger
                      onClick={() => handleStartChapterSelect(chapter.id)}
                      className={`px-4 py-3 hover:bg-blue-50 ${startChapter === chapter.id ? "bg-blue-50 text-blue-700 font-medium" : ""}`}
                    >
                      <div className="flex items-center">
                        <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                        <span>{chapter.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-gray-50">
                      <div className="space-y-1 p-2">
                        {chapter.sections.map((section) => (
                          <Button
                            key={section.id}
                            variant={startSection === section.id ? "default" : "outline"}
                            className={`w-full justify-between text-left p-3 ${
                              startSection === section.id
                                ? "bg-blue-600 text-white"
                                : "hover:bg-blue-100 hover:text-blue-700"
                            }`}
                            onClick={() => handleStartSectionSelect(section.id)}
                          >
                            <div className="flex items-start flex-col">
                              <span className="font-medium">{section.title}</span>
                              <span className="text-xs mt-1 opacity-80">
                                P.{section.pages} / 問{section.problems}
                              </span>
                            </div>
                            <ChevronRight className="h-5 w-5 ml-2 flex-shrink-0" />
                          </Button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {step === "end" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-center mb-4 text-blue-700">
                <span className="inline-flex items-center justify-center bg-blue-700 text-white rounded-full w-6 h-6 mr-2">
                  2
                </span>
                試験範囲（終わり）を選択
              </h3>

              <Accordion type="single" collapsible className="w-full">
                {mathChapters.map((chapter) => {
                  // 開始章より前の章は選択不可
                  const isDisabled = startChapter !== null && chapter.id < startChapter

                  return (
                    <AccordionItem
                      key={chapter.id}
                      value={`chapter-${chapter.id}`}
                      className={`border border-gray-200 rounded-lg mb-2 overflow-hidden ${
                        isDisabled ? "opacity-50" : ""
                      }`}
                    >
                      <AccordionTrigger
                        onClick={() => !isDisabled && handleEndChapterSelect(chapter.id)}
                        className={`px-4 py-3 hover:bg-blue-50 ${
                          endChapter === chapter.id ? "bg-blue-50 text-blue-700 font-medium" : ""
                        } ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                        disabled={isDisabled}
                      >
                        <div className="flex items-center">
                          <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                          <span>{chapter.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="bg-gray-50">
                        <div className="space-y-1 p-2">
                          {chapter.sections.map((section) => {
                            // 同じ章の場合、開始セクションより前のセクションは選択不可
                            const isSectionDisabled =
                              startChapter === chapter.id &&
                              startSection !== null &&
                              chapter.sections.findIndex((s) => s.id === section.id) <
                                chapter.sections.findIndex((s) => s.id === startSection)

                            return (
                              <Button
                                key={section.id}
                                variant={endSection === section.id ? "default" : "outline"}
                                className={`w-full justify-between text-left p-3 ${
                                  endSection === section.id
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-blue-100 hover:text-blue-700"
                                } ${isSectionDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                onClick={() => !isSectionDisabled && handleEndSectionSelect(section.id)}
                                disabled={isSectionDisabled}
                              >
                                <div className="flex items-start flex-col">
                                  <span className="font-medium">{section.title}</span>
                                  <span className="text-xs mt-1 opacity-80">
                                    P.{section.pages} / 問{section.problems}
                                  </span>
                                </div>
                                <ChevronRight className="h-5 w-5 ml-2 flex-shrink-0" />
                              </Button>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>

              <Button variant="outline" className="w-full" onClick={() => setStep("start")}>
                戻る
              </Button>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-medium text-green-800">選択完了</h3>
                </div>
                <p className="text-green-700 mb-2">
                  以下の範囲が試験範囲として設定されます。この範囲の問題がスパークリストに追加されます。
                </p>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1 hover:bg-gray-100" onClick={handleReset}>
                  初めからやり直す
                </Button>
                <Button variant="outline" className="flex-1 hover:bg-blue-50" onClick={() => setStep("end")}>
                  終了位置を選び直す
                </Button>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium"
                onClick={handleConfirmClick}
              >
                試験範囲を決定（学習計画を立てる）
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 確認ダイアログ */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認</AlertDialogTitle>
            <AlertDialogDescription>学習履歴が初期化されますが、本当に試験範囲を決定しますか？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleConfirm}>決定する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showOrderWarning} onOpenChange={setShowOrderWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>範囲の順序が不正です</AlertDialogTitle>
            <AlertDialogDescription>
              終了範囲は開始範囲より後である必要があります。別の範囲を選択してください。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowOrderWarning(false)}>了解しました</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
