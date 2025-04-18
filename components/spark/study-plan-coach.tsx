"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CoachAvatar } from "@/components/ui/coach-avatar"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Send } from "lucide-react"

interface StudyPlanCoachProps {
  onPlanCreated: () => void
  hasPlan?: boolean
  maxReviewDays: number
}

type Message = {
  id: string
  sender: "coach" | "user"
  content: string
  options?: Option[]
}

type Option = {
  id: string
  text: string
  value: any
}

type Step = "welcome" | "problem-range" | "level" | "review-period" | "review-days" | "confirm" | "complete"

export function StudyPlanCoach({ onPlanCreated, hasPlan = false, maxReviewDays }: StudyPlanCoachProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState<Step>("welcome")
  const [studyLevels, setStudyLevels] = useState({
    basic: true,
    standard: true,
    advanced: false,
  })
  const [reviewPeriod, setReviewPeriod] = useState(7)
  const [reviewDays, setReviewDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: true,
  })
  const [problemRange, setProblemRange] = useState({
    unsolved: true,
    incorrect: true,
    partial: true,
    complete: false,
  })
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)

  // 初期メッセージを設定
  useEffect(() => {
    const initialMessage: Message = {
      id: "welcome",
      sender: "coach",
      content: hasPlan
        ? "学習計画を修正するのですね！一緒に見直していきましょう。まずは、どの問題を再度スケジュールに入れるか決めましょう。"
        : "こんにちは！学習計画を一緒に立てていきましょう。まずは、どのレベルの問題に取り組むか決めましょう。",
      options: hasPlan ? [] : [{ id: "level", text: "学習レベルを選ぶ", value: "level" }],
    }

    setMessages([initialMessage])
    setCurrentStep(hasPlan ? "problem-range" : "welcome")

    // 少し遅延させて問題範囲の選択肢を表示（hasPlanの場合のみ）
    if (hasPlan) {
      setTimeout(() => {
        addCoachMessage("problem-range", "どの問題を再度スケジュールに入れますか？", [
          { id: "problem-range", text: "問題範囲を選ぶ", value: "problem-range" },
        ])
      }, 1000)
    }
  }, [hasPlan])

  // コーチからのメッセージを追加
  const addCoachMessage = (id: string, content: string, options: Option[] = []) => {
    const newMessage: Message = {
      id,
      sender: "coach",
      content,
      options,
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

  // 選択肢がクリックされたときの処理
  const handleOptionClick = (step: Step) => {
    switch (step) {
      case "level":
        addUserMessage("学習レベルを選びます")
        setCurrentStep("level")
        setTimeout(() => {
          addCoachMessage("level-options", "どのレベルの問題に取り組みますか？複数選択できます。", [
            { id: "level-select", text: "レベルを選択する", value: "level-select" },
          ])
        }, 500)
        break

      case "problem-range":
        addUserMessage("問題範囲を選びます")
        setCurrentStep("problem-range")
        setTimeout(() => {
          addCoachMessage("problem-range-options", "どの問題を再度スケジュールに入れますか？複数選択できます。", [
            { id: "problem-range-select", text: "問題範囲を選択する", value: "problem-range-select" },
          ])
        }, 500)
        break

      case "review-period":
        addUserMessage("復習期間を決めます")
        setCurrentStep("review-period")
        setTimeout(() => {
          addCoachMessage("review-period-options", `テスト直前の復習期間は何日にしますか？（最大${maxReviewDays}日）`, [
            { id: "review-period-select", text: "復習期間を選択する", value: "review-period-select" },
          ])
        }, 500)
        break

      case "review-days":
        addUserMessage("復習曜日を決めます")
        setCurrentStep("review-days")
        setTimeout(() => {
          addCoachMessage(
            "review-days-options",
            "どの曜日を復習日にしますか？この日は新しい問題に取り組まない日になります。",
            [{ id: "review-days-select", text: "復習曜日を選択する", value: "review-days-select" }],
          )
        }, 500)
        break

      case "confirm":
        addUserMessage("設定を確認します")
        setCurrentStep("confirm")

        // 設定内容の確認メッセージを作成
        const levelText = Object.entries(studyLevels)
          .filter(([_, selected]) => selected)
          .map(([level, _]) => {
            switch (level) {
              case "basic":
                return "基本問題"
              case "standard":
                return "標準問題"
              case "advanced":
                return "発展問題"
              default:
                return ""
            }
          })
          .join("、")

        const daysText = Object.entries(reviewDays)
          .filter(([_, selected]) => selected)
          .map(([day, _]) => {
            switch (day) {
              case "monday":
                return "月"
              case "tuesday":
                return "火"
              case "wednesday":
                return "水"
              case "thursday":
                return "木"
              case "friday":
                return "金"
              case "saturday":
                return "土"
              case "sunday":
                return "日"
              default:
                return ""
            }
          })
          .join("、")

        let rangeText = ""
        if (hasPlan) {
          rangeText = Object.entries(problemRange)
            .filter(([_, selected]) => selected)
            .map(([range, _]) => {
              switch (range) {
                case "unsolved":
                  return "未着手の問題"
                case "incorrect":
                  return "誤答（×）の問題"
                case "partial":
                  return "一部正解（△）の問題"
                case "complete":
                  return "完答（⚪︎）の問題"
                default:
                  return ""
              }
            })
            .join("、")

          rangeText = `\n・問題範囲: ${rangeText}`
        }

        const confirmMessage = `以下の設定で学習計画を作成します。よろしいですか？${rangeText}\n・学習レベル: ${levelText}\n・復習期間: ${reviewPeriod}日間\n・復習曜日: ${daysText}曜日`

        setTimeout(() => {
          addCoachMessage("confirm-options", confirmMessage, [
            { id: "create-plan", text: "学習計画を作成する", value: "create-plan" },
            { id: "modify", text: "設定を変更する", value: "modify" },
          ])
        }, 500)
        break

      case "create-plan":
        addUserMessage("この設定で学習計画を作成します")
        setIsCreatingPlan(true)

        // 学習計画作成のモックアルゴリズム
        setTimeout(() => {
          addCoachMessage("creating", "学習計画を作成しています...", [])

          setTimeout(() => {
            // 学習計画の作成が完了したことをローカルストレージに記録
            localStorage.setItem("has_study_plan", "true")
            localStorage.setItem("study_levels", JSON.stringify(studyLevels))
            localStorage.setItem("review_period", reviewPeriod.toString())
            localStorage.setItem("review_days", JSON.stringify(reviewDays))

            if (hasPlan) {
              localStorage.setItem("problem_range", JSON.stringify(problemRange))
            }

            addCoachMessage("complete", "学習計画の作成が完了しました！スパークリストに反映されています。", [])
            setCurrentStep("complete")
            setIsCreatingPlan(false)

            // 親コンポーネントに計画作成完了を通知
            setTimeout(() => {
              onPlanCreated()
            }, 1500)
          }, 2000)
        }, 1000)
        break

      case "modify":
        addUserMessage("設定を変更します")

        // 最初のステップに戻る
        setTimeout(() => {
          if (hasPlan) {
            setCurrentStep("problem-range")
            addCoachMessage("problem-range", "どの問題を再度スケジュールに入れますか？", [
              { id: "problem-range", text: "問題範囲を選ぶ", value: "problem-range" },
            ])
          } else {
            setCurrentStep("level")
            addCoachMessage("level-options", "どのレベルの問題に取り組みますか？複数選択できます。", [
              { id: "level-select", text: "レベルを選択する", value: "level-select" },
            ])
          }
        }, 500)
        break

      default:
        break
    }
  }

  // 学習レベルの選択が完了したときの処理
  const handleLevelSelectComplete = () => {
    const levelText = Object.entries(studyLevels)
      .filter(([_, selected]) => selected)
      .map(([level, _]) => {
        switch (level) {
          case "basic":
            return "基本問題"
          case "standard":
            return "標準問題"
          case "advanced":
            return "発展問題"
          default:
            return ""
        }
      })
      .join("、")

    addUserMessage(`選択したレベル: ${levelText}`)

    setTimeout(() => {
      addCoachMessage("level-next", "学習レベルを設定しました。次は復習期間を決めましょう。", [
        { id: "review-period", text: "復習期間を決める", value: "review-period" },
      ])
    }, 500)
  }

  // 問題範囲の選択が完了したときの処理
  const handleProblemRangeSelectComplete = () => {
    const rangeText = Object.entries(problemRange)
      .filter(([_, selected]) => selected)
      .map(([range, _]) => {
        switch (range) {
          case "unsolved":
            return "未着手の問題"
          case "incorrect":
            return "誤答（×）の問題"
          case "partial":
            return "一部正解（△）の問題"
          case "complete":
            return "完答（⚪︎）の問題"
          default:
            return ""
        }
      })
      .join("、")

    addUserMessage(`選択した問題範囲: ${rangeText}`)

    setTimeout(() => {
      addCoachMessage("problem-range-next", "問題範囲を設定しました。次は学習レベルを決めましょう。", [
        { id: "level", text: "学習レベルを決める", value: "level" },
      ])
    }, 500)
  }

  // 復習期間の選択が完了したときの処理
  const handleReviewPeriodSelectComplete = () => {
    addUserMessage(`選択した復習期間: ${reviewPeriod}日間`)

    setTimeout(() => {
      addCoachMessage("review-period-next", "復習期間を設定しました。次は復習曜日を決めましょう。", [
        { id: "review-days", text: "復習曜日を決める", value: "review-days" },
      ])
    }, 500)
  }

  // 復習曜日の選択が完了したときの処理
  const handleReviewDaysSelectComplete = () => {
    const daysText = Object.entries(reviewDays)
      .filter(([_, selected]) => selected)
      .map(([day, _]) => {
        switch (day) {
          case "monday":
            return "月"
          case "tuesday":
            return "火"
          case "wednesday":
            return "水"
          case "thursday":
            return "木"
          case "friday":
            return "金"
          case "saturday":
            return "土"
          case "sunday":
            return "日"
          default:
            return ""
        }
      })
      .join("、")

    addUserMessage(`選択した復習曜日: ${daysText}曜日`)

    setTimeout(() => {
      addCoachMessage("review-days-next", "復習曜日を設定しました。これで設定は完了です。確認しましょう。", [
        { id: "confirm", text: "設定を確認する", value: "confirm" },
      ])
    }, 500)
  }

  return (
    <Card className="mb-4 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">コーチと一緒に学習計画を立てる</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="chat-container h-[400px] overflow-y-auto mb-4 p-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === "coach" ? "coach-message" : "user-message"}`}
            >
              {message.sender === "coach" && (
                <div className="flex items-center mb-1">
                  <CoachAvatar size={24} className="mr-2" />
                  <span className="text-xs text-gray-500">コーチ</span>
                </div>
              )}
              {message.sender === "user" && (
                <div className="flex items-center justify-end mb-1">
                  <span className="text-xs text-gray-500">あなた</span>
                  <UserAvatar size={24} className="ml-2" />
                </div>
              )}
              <div>{message.content}</div>

              {message.options && message.options.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.options.map((option) => (
                    <Button
                      key={option.id}
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleOptionClick(option.value)}
                    >
                      {option.text}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* 学習レベル選択UI */}
          {currentStep === "level" && (
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium mb-2">学習モード（問題のレベル）</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coach-level-basic"
                    checked={studyLevels.basic}
                    onCheckedChange={() => setStudyLevels({ ...studyLevels, basic: !studyLevels.basic })}
                  />
                  <Label htmlFor="coach-level-basic">基本問題</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coach-level-standard"
                    checked={studyLevels.standard}
                    onCheckedChange={() => setStudyLevels({ ...studyLevels, standard: !studyLevels.standard })}
                  />
                  <Label htmlFor="coach-level-standard">標準問題</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coach-level-advanced"
                    checked={studyLevels.advanced}
                    onCheckedChange={() => setStudyLevels({ ...studyLevels, advanced: !studyLevels.advanced })}
                  />
                  <Label htmlFor="coach-level-advanced">発展問題</Label>
                </div>
              </div>
              <Button
                className="mt-4 w-full"
                size="sm"
                onClick={handleLevelSelectComplete}
                disabled={!studyLevels.basic && !studyLevels.standard && !studyLevels.advanced}
              >
                決定
              </Button>
            </div>
          )}

          {/* 問題範囲選択UI */}
          {currentStep === "problem-range" && (
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium mb-2">問題範囲設定</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coach-problem-unsolved"
                    checked={problemRange.unsolved}
                    onCheckedChange={() => setProblemRange({ ...problemRange, unsolved: !problemRange.unsolved })}
                  />
                  <Label htmlFor="coach-problem-unsolved">未着手の問題</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coach-problem-incorrect"
                    checked={problemRange.incorrect}
                    onCheckedChange={() => setProblemRange({ ...problemRange, incorrect: !problemRange.incorrect })}
                  />
                  <Label htmlFor="coach-problem-incorrect">誤答（×）の問題</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coach-problem-partial"
                    checked={problemRange.partial}
                    onCheckedChange={() => setProblemRange({ ...problemRange, partial: !problemRange.partial })}
                  />
                  <Label htmlFor="coach-problem-partial">一部正解（△）の問題</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coach-problem-complete"
                    checked={problemRange.complete}
                    onCheckedChange={() => setProblemRange({ ...problemRange, complete: !problemRange.complete })}
                  />
                  <Label htmlFor="coach-problem-complete">完答（⚪︎）の問題</Label>
                </div>
              </div>
              <Button
                className="mt-4 w-full"
                size="sm"
                onClick={handleProblemRangeSelectComplete}
                disabled={
                  !problemRange.unsolved && !problemRange.incorrect && !problemRange.partial && !problemRange.complete
                }
              >
                決定
              </Button>
            </div>
          )}

          {/* 復習期間選択UI */}
          {currentStep === "review-period" && (
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium mb-2">試験直前の復習期間（日数）</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max={maxReviewDays}
                  value={reviewPeriod}
                  onChange={(e) => setReviewPeriod(Number.parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="font-medium">{reviewPeriod}日</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                選んだ期間は、試験直前の復習期間に充てます。実際に問題に取り組む学習期間は、今日から復習期間までになります。
              </p>
              <Button className="mt-4 w-full" size="sm" onClick={handleReviewPeriodSelectComplete}>
                決定
              </Button>
            </div>
          )}

          {/* 復習曜日選択UI */}
          {currentStep === "review-days" && (
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium mb-2">復習曜日</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coach-day-monday"
                    checked={reviewDays.monday}
                    onCheckedChange={() => setReviewDays({ ...reviewDays, monday: !reviewDays.monday })}
                  />
                  <Label htmlFor="coach-day-monday">月</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coach-day-tuesday"
                    checked={reviewDays.tuesday}
                    onCheckedChange={() => setReviewDays({ ...reviewDays, tuesday: !reviewDays.tuesday })}
                  />
                  <Label htmlFor="coach-day-tuesday">火</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coach-day-wednesday"
                    checked={reviewDays.wednesday}
                    onCheckedChange={() => setReviewDays({ ...reviewDays, wednesday: !reviewDays.wednesday })}
                  />
                  <Label htmlFor="coach-day-wednesday">水</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coach-day-thursday"
                    checked={reviewDays.thursday}
                    onCheckedChange={() => setReviewDays({ ...reviewDays, thursday: !reviewDays.thursday })}
                  />
                  <Label htmlFor="coach-day-thursday">木</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coach-day-friday"
                    checked={reviewDays.friday}
                    onCheckedChange={() => setReviewDays({ ...reviewDays, friday: !reviewDays.friday })}
                  />
                  <Label htmlFor="coach-day-friday">金</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coach-day-saturday"
                    checked={reviewDays.saturday}
                    onCheckedChange={() => setReviewDays({ ...reviewDays, saturday: !reviewDays.saturday })}
                  />
                  <Label htmlFor="coach-day-saturday">土</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coach-day-sunday"
                    checked={reviewDays.sunday}
                    onCheckedChange={() => setReviewDays({ ...reviewDays, sunday: !reviewDays.sunday })}
                  />
                  <Label htmlFor="coach-day-sunday">日</Label>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">この曜日は新しい問題に取り組まない日となります。</p>
              <Button
                className="mt-4 w-full"
                size="sm"
                onClick={handleReviewDaysSelectComplete}
                disabled={
                  Object.values(reviewDays).every((day) => !day) || Object.values(reviewDays).every((day) => day)
                }
              >
                決定
              </Button>
            </div>
          )}
        </div>

        {currentStep !== "complete" && !isCreatingPlan && (
          <div className="flex items-center">
            <Button variant="outline" size="icon" className="rounded-full" disabled={true}>
              <Send className="h-4 w-4" />
            </Button>
            <p className="text-xs text-gray-500 ml-2">コーチの質問に答えて学習計画を作成しましょう</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
