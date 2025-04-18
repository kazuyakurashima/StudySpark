"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CoachAvatar } from "@/components/ui/coach-avatar"
import { UserAvatar } from "@/components/ui/user-avatar"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"

interface StudyPlanCoachChatProps {
  onPlanCreated: (settings: {
    levels: { basic: boolean; standard: boolean; advanced: boolean }
    reviewPeriod: number
    reviewDays: { [key: string]: boolean }
    problemRange?: { unsolved: boolean; incorrect: boolean; partial: boolean; complete: boolean }
  }) => void
  hasPlan?: boolean
  maxReviewDays: number
}

type Message = {
  id: string
  sender: "coach" | "user" | "system"
  content: string
  isSelectionUI?: boolean
  selectionType?: "level" | "reviewPeriod" | "reviewDays" | "problemRange" | "confirm"
}

type LevelOption = "basic" | "standard" | "all"
type ReviewPeriodOption = 3 | 5 | 7 | 14
type ReviewDaysOption = "sunday" | "weekend" | "threeday"
type ProblemRangeOption = "all_except_complete" | "unsolved_and_incorrect" | "unsolved_only"

export function StudyPlanCoachChat({ onPlanCreated, hasPlan = false, maxReviewDays }: StudyPlanCoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedLevel, setSelectedLevel] = useState<LevelOption>("standard")
  const [selectedReviewPeriod, setSelectedReviewPeriod] = useState<ReviewPeriodOption>(7)
  const [selectedReviewDays, setSelectedReviewDays] = useState<ReviewDaysOption>("sunday")
  const [selectedProblemRange, setSelectedProblemRange] = useState<ProblemRangeOption>("all_except_complete")
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 初期メッセージを設定
  useEffect(() => {
    const initialMessages: Message[] = []

    if (hasPlan) {
      initialMessages.push({
        id: "welcome",
        sender: "coach",
        content:
          "学習計画を修正するのですね！一緒に見直していきましょう。まずは、どの問題を再度スケジュールに入れるか教えてください。",
        isSelectionUI: true,
        selectionType: "problemRange",
      })
    } else {
      initialMessages.push({
        id: "welcome",
        sender: "coach",
        content: "こんにちは！学習計画を一緒に立てていきましょう。まずは、どのレベルの問題に取り組むか教えてください。",
        isSelectionUI: true,
        selectionType: "level",
      })
    }

    setMessages(initialMessages)
  }, [hasPlan])

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // コーチからのメッセージを追加
  const addCoachMessage = (content: string, isSelectionUI = false, selectionType?: Message["selectionType"]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "coach",
      content,
      isSelectionUI,
      selectionType,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  // ユーザーからのメッセージを追加
  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  // システムメッセージを追加
  const addSystemMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "system",
      content,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  // 学習レベルの選択完了時の処理
  const handleLevelSelect = (level: LevelOption) => {
    setSelectedLevel(level)

    let levelText = ""
    switch (level) {
      case "basic":
        levelText = "基本重視"
        break
      case "standard":
        levelText = "標準まで（オススメ）"
        break
      case "all":
        levelText = "全問取り組む"
        break
    }

    addUserMessage(`${levelText}を選びました`)

    setTimeout(() => {
      if (hasPlan) {
        addCoachMessage("次に復習期間を決めましょう。テスト直前の何日間を復習に充てますか？", true, "reviewPeriod")
      } else {
        addCoachMessage(
          "学習レベルを設定しました。次は復習期間を決めましょう。テスト直前の何日間を復習に充てますか？",
          true,
          "reviewPeriod",
        )
      }
    }, 500)
  }

  // 問題範囲の選択完了時の処理
  const handleProblemRangeSelect = (option: ProblemRangeOption) => {
    setSelectedProblemRange(option)

    let rangeText = ""
    switch (option) {
      case "all_except_complete":
        rangeText = "完答（⚪︎）の問題以外（オススメ）"
        break
      case "unsolved_and_incorrect":
        rangeText = "未着手と誤答（×）の問題"
        break
      case "unsolved_only":
        rangeText = "未着手の問題"
        break
    }

    addUserMessage(`${rangeText}を選びました`)

    setTimeout(() => {
      addCoachMessage(
        "問題範囲を設定しました。次は学習レベルを決めましょう。どのレベルの問題に取り組みますか？",
        true,
        "level",
      )
    }, 500)
  }

  // 復習期間の選択完了時の処理
  const handleReviewPeriodSelect = (period: ReviewPeriodOption) => {
    setSelectedReviewPeriod(period)
    addUserMessage(`復習期間は${period}日間にします`)

    setTimeout(() => {
      addCoachMessage(
        "復習期間を設定しました。次は復習曜日を決めましょう。どの曜日を復習日にしますか？この日は新しい問題に取り組まない日になります。",
        true,
        "reviewDays",
      )
    }, 500)
  }

  // 復習曜日の選択完了時の処理
  const handleReviewDaysSelect = (option: ReviewDaysOption) => {
    setSelectedReviewDays(option)

    let daysText = ""
    switch (option) {
      case "sunday":
        daysText = "日曜日"
        break
      case "weekend":
        daysText = "土曜日と日曜日"
        break
      case "threeday":
        daysText = "金曜日、土曜日、日曜日"
        break
    }

    addUserMessage(`復習曜日は${daysText}にします`)

    setTimeout(() => {
      // 設定内容の確認メッセージを作成
      let levelText = ""
      switch (selectedLevel) {
        case "basic":
          levelText = "基本重視"
          break
        case "standard":
          levelText = "標準まで（オススメ）"
          break
        case "all":
          levelText = "全問取り組む"
          break
      }

      let rangeText = ""
      if (hasPlan) {
        switch (selectedProblemRange) {
          case "all_except_complete":
            rangeText = "完答（⚪︎）の問題以外（オススメ）"
            break
          case "unsolved_and_incorrect":
            rangeText = "未着手と誤答（×）の問題"
            break
          case "unsolved_only":
            rangeText = "未着手の問題"
            break
        }
        rangeText = `
・問題範囲: ${rangeText}`
      }

      const confirmMessage = `以下の設定で学習計画を作成します。よろしいですか？${rangeText}
・学習レベル: ${levelText}
・復習期間: ${selectedReviewPeriod}日間
・復習曜日: ${daysText}`

      addCoachMessage(confirmMessage, true, "confirm")
    }, 500)
  }

  // 学習計画作成の確認
  const handleConfirm = (confirmed: boolean) => {
    if (confirmed) {
      addUserMessage("この設定で学習計画を作成します")
      setIsCreatingPlan(true)

      // 学習計画作成のモックアルゴリズム
      setTimeout(() => {
        addSystemMessage("学習計画を作成しています...")

        setTimeout(() => {
          // 学習レベルをstudyLevelsオブジェクトに変換
          const studyLevels = {
            basic: true,
            standard: selectedLevel === "standard" || selectedLevel === "all",
            advanced: selectedLevel === "all",
          }

          // 復習曜日をreviewDaysオブジェクトに変換
          const reviewDays = {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: selectedReviewDays === "threeday",
            saturday: selectedReviewDays === "weekend" || selectedReviewDays === "threeday",
            sunday: true, // 日曜日は常に選択
          }

          // 問題範囲をproblemRangeオブジェクトに変換
          const problemRange = {
            unsolved:
              selectedProblemRange === "all_except_complete" ||
              selectedProblemRange === "unsolved_and_incorrect" ||
              selectedProblemRange === "unsolved_only",
            incorrect:
              selectedProblemRange === "all_except_complete" || selectedProblemRange === "unsolved_and_incorrect",
            partial: selectedProblemRange === "all_except_complete",
            complete: false,
          }

          // 学習計画の作成が完了したことをローカルストレージに記録
          localStorage.setItem("has_study_plan", "true")
          localStorage.setItem("study_levels", JSON.stringify(studyLevels))
          localStorage.setItem("review_period", selectedReviewPeriod.toString())
          localStorage.setItem("review_days", JSON.stringify(reviewDays))

          // 設定を親コンポーネントに渡す
          const settings = {
            levels: studyLevels,
            reviewPeriod: selectedReviewPeriod,
            reviewDays,
          }

          if (hasPlan) {
            localStorage.setItem("problem_range", JSON.stringify(problemRange))
            settings.problemRange = problemRange
          }

          addCoachMessage("学習計画の作成が完了しました！スパークリストに反映されています。")
          setIsCreatingPlan(false)

          // 親コンポーネントに計画作成完了を通知
          setTimeout(() => {
            onPlanCreated(settings)
          }, 1500)
        }, 2000)
      }, 1000)
    } else {
      addUserMessage("設定を変更します")

      // 最初のステップに戻る
      setTimeout(() => {
        if (hasPlan) {
          addCoachMessage("どの問題を再度スケジュールに入れますか？", true, "problemRange")
        } else {
          addCoachMessage("どのレベルの問題に取り組みますか？", true, "level")
        }
      }, 500)
    }
  }

  // 問題範囲選択UI
  const ProblemRangeSelectionUI = () => (
    <div className="w-full space-y-3">
      <div
        className={cn(
          "bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center cursor-pointer shadow-md hover:shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1",
          selectedProblemRange === "all_except_complete" ? "border-blue-300" : "",
        )}
        onClick={() => handleProblemRangeSelect("all_except_complete")}
      >
        <div>
          <div className="font-medium">
            完答（⚪︎）の問題以外 <span className="font-bold">（オススメ）</span>
          </div>
          <div className="text-sm text-gray-500">（未着手、誤答、一部正解の問題に取り組む）</div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      <div
        className={cn(
          "bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center cursor-pointer shadow-md hover:shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1",
          selectedProblemRange === "unsolved_and_incorrect" ? "border-blue-300" : "",
        )}
        onClick={() => handleProblemRangeSelect("unsolved_and_incorrect")}
      >
        <div>
          <div className="font-medium">未着手と誤答（×）の問題</div>
          <div className="text-sm text-gray-500">（まだ取り組んでいない問題と間違えた問題に取り組む）</div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      <div
        className={cn(
          "bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center cursor-pointer shadow-md hover:shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1",
          selectedProblemRange === "unsolved_only" ? "border-blue-300" : "",
        )}
        onClick={() => handleProblemRangeSelect("unsolved_only")}
      >
        <div>
          <div className="font-medium">未着手の問題</div>
          <div className="text-sm text-gray-500">（まだ取り組んでいない問題のみに取り組む）</div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  )

  // LevelSelectionUI 関数を修正して、おすすめの選択肢は太字にするが背景色は変えないようにします
  const LevelSelectionUI = () => (
    <div className="w-full space-y-3">
      <div
        className={cn(
          "bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center cursor-pointer shadow-md hover:shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1",
          selectedLevel === "basic" ? "border-blue-300" : "",
        )}
        onClick={() => handleLevelSelect("basic")}
      >
        <div>
          <div className="font-medium">基本重視</div>
          <div className="text-sm text-gray-500">（基本問題に取り組む）</div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      <div
        className={cn(
          "bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center cursor-pointer shadow-md hover:shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1",
          selectedLevel === "standard" ? "border-blue-300" : "",
        )}
        onClick={() => handleLevelSelect("standard")}
      >
        <div>
          <div className="font-medium">
            標準まで <span className="font-bold">（オススメ）</span>
          </div>
          <div className="text-sm text-gray-500">（基本問題と標準問題に取り組む）</div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      <div
        className={cn(
          "bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center cursor-pointer shadow-md hover:shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1",
          selectedLevel === "all" ? "border-blue-300" : "",
        )}
        onClick={() => handleLevelSelect("all")}
      >
        <div>
          <div className="font-medium">全問取り組む</div>
          <div className="text-sm text-gray-500">（基本問題、標準問題、発展問題全てに取り組む）</div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  )

  // ReviewPeriodSelectionUI 関数も同様に修正
  const ReviewPeriodSelectionUI = () => {
    // 利用可能な復習期間オプション
    const availableOptions: ReviewPeriodOption[] = [3, 5, 7, 14].filter(
      (days) => days <= maxReviewDays,
    ) as ReviewPeriodOption[]

    return (
      <div className="w-full space-y-3">
        {availableOptions.map((days) => (
          <div
            key={days}
            className={cn(
              "bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center cursor-pointer shadow-md hover:shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1",
              selectedReviewPeriod === days ? "border-blue-300" : "",
            )}
            onClick={() => handleReviewPeriodSelect(days)}
          >
            <div>
              <div className="font-medium">
                {days}日間{days === 7 ? <span className="font-bold">（オススメ）</span> : ""}
              </div>
              <div className="text-sm text-gray-500">（テスト前{days}日間は復習に充てます）</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        ))}
      </div>
    )
  }

  // ReviewDaysSelectionUI 関数も同様に修正
  const ReviewDaysSelectionUI = () => (
    <div className="w-full space-y-3">
      <div
        className={cn(
          "bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center cursor-pointer shadow-md hover:shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1",
          selectedReviewDays === "sunday" ? "border-blue-300" : "",
        )}
        onClick={() => handleReviewDaysSelect("sunday")}
      >
        <div>
          <div className="font-medium">
            日曜 <span className="font-bold">（オススメ）</span>
          </div>
          <div className="text-sm text-gray-500">（日曜日は復習日になります）</div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      <div
        className={cn(
          "bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center cursor-pointer shadow-md hover:shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1",
          selectedReviewDays === "weekend" ? "border-blue-300" : "",
        )}
        onClick={() => handleReviewDaysSelect("weekend")}
      >
        <div>
          <div className="font-medium">土曜・日曜</div>
          <div className="text-sm text-gray-500">（土曜日と日曜日は復習日になります）</div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      <div
        className={cn(
          "bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center cursor-pointer shadow-md hover:shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 transform hover:-translate-y-1",
          selectedReviewDays === "threeday" ? "border-blue-300" : "",
        )}
        onClick={() => handleReviewDaysSelect("threeday")}
      >
        <div>
          <div className="font-medium">金曜・土曜・日曜</div>
          <div className="text-sm text-gray-500">（金曜日、土曜日、日曜日は復習日になります）</div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  )

  // 確認UI
  const ConfirmUI = () => (
    <div className="w-full space-y-3">
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h3 className="text-sm font-medium mb-2">設定内容の確認</h3>
        <p className="whitespace-pre-line text-sm">{messages[messages.length - 1].content}</p>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          className="flex-1 goal-button py-3 text-base hover-effect"
          onClick={() => handleConfirm(false)}
        >
          変更する
        </Button>
        <Button className="flex-1 goal-button py-3 text-base hover-effect" onClick={() => handleConfirm(true)}>
          作成する
        </Button>
      </div>
    </div>
  )

  // 選択UIのレンダリング
  const renderSelectionUI = (type: Message["selectionType"]) => {
    switch (type) {
      case "level":
        return <LevelSelectionUI />
      case "problemRange":
        return <ProblemRangeSelectionUI />
      case "reviewPeriod":
        return <ReviewPeriodSelectionUI />
      case "reviewDays":
        return <ReviewDaysSelectionUI />
      case "confirm":
        return <ConfirmUI />
      default:
        return null
    }
  }

  return (
    <Card className="mb-4 animate-fade-in shadow-sm border-0 coach-ui-container">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">コーチと一緒に学習計画を立てる</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="chat-container h-[400px] overflow-y-auto mb-4 p-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "mb-4",
                message.sender === "coach"
                  ? "coach-message-container"
                  : message.sender === "user"
                    ? "user-message-container"
                    : "system-message-container",
              )}
            >
              {message.sender === "coach" && (
                <div className="flex items-start space-x-2">
                  <CoachAvatar size={32} className="flex-shrink-0 mt-1" />
                  <div className="flex flex-col">
                    <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none max-w-[85%]">
                      <p className="whitespace-pre-line">{message.content}</p>
                    </div>
                    {message.isSelectionUI && message.selectionType && (
                      <div className="mt-2 w-full">{renderSelectionUI(message.selectionType)}</div>
                    )}
                  </div>
                </div>
              )}

              {message.sender === "user" && (
                <div className="flex items-start justify-end space-x-2">
                  <div className="bg-blue-500 text-white p-3 rounded-lg rounded-tr-none max-w-[85%]">
                    <p>{message.content}</p>
                  </div>
                  <UserAvatar size={32} className="flex-shrink-0 mt-1" />
                </div>
              )}

              {message.sender === "system" && (
                <div className="flex justify-center">
                  <div className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700">{message.content}</div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {isCreatingPlan && (
          <div className="flex justify-center">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </CardContent>

      {/* 警告ダイアログ */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>注意</AlertDialogTitle>
            <AlertDialogDescription>{warningMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowWarningDialog(false)}>了解しました</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
