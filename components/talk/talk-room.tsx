"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send, Award, TrendingUp, Calendar, Brain } from "lucide-react"
import Image from "next/image"

interface Message {
  id: string
  sender: "user" | "coach"
  content: string
  timestamp: Date
  quickReplies?: string[]
  previousMessage?: string
  badges?: string[]
}

function TalkRoom() {
  const [activeTab, setActiveTab] = useState("today")
  const [message, setMessage] = useState("")
  const [selectedQuickReply, setSelectedQuickReply] = useState<string | null>(null)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const [coachInfo, setCoachInfo] = useState<any>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [scrollPositions, setScrollPositions] = useState({ today: 0, week: 0 })
  const [isComponentMounted, setIsComponentMounted] = useState(false)

  // 日次メッセージ
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "coach",
      content: "こんにちは！今日の学習はどうだった？振り返ってみよう！",
      timestamp: new Date(),
      quickReplies: [
        "今日はとても集中できた！",
        "少し難しい問題があった",
        "思ったより進まなかった",
        "計画通りに進められた",
      ],
    },
  ])

  // 週次メッセージ
  const [weeklyMessages, setWeeklyMessages] = useState<Message[]>([
    {
      id: "w1",
      sender: "coach",
      content: "今週の学習を振り返ってみよう。どんな成果があった？どんな課題が見つかった？",
      timestamp: new Date(),
      quickReplies: ["目標より多く進められた", "計画通りに進んでいる", "少し遅れ気味かも", "苦手分野に時間がかかった"],
      previousMessage: "先週は「少し遅れ気味だけど、頑張りたい」と言っていたね。今週はどうだった？",
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const todayChatContainerRef = useRef<HTMLDivElement>(null)
  const weekChatContainerRef = useRef<HTMLDivElement>(null)

  // 学習データ（モック）- 日次
  const todayStats = {
    problemsAttempted: 15,
    complete: 8,
    partial: 4,
    incorrect: 3,
    totalComplete: 25,
    totalProblems: 100,
    streakDays: 5,
  }

  // 学習データ（モック）- 週次
  const weeklyStats = {
    daysStudied: 4,
    problemsAttempted: 45,
    weeklyComplete: 30,
    weeklyCompleteRate: 67,
    totalComplete: 50,
    totalCompleteRate: 50,
    lastWeekRate: 58, // 先週の完答率
    improvement: 9, // 改善率
  }

  // コンポーネントがマウントされたことを確認
  useEffect(() => {
    setIsComponentMounted(true)
    return () => setIsComponentMounted(false)
  }, [])

  // コーチ情報の読み込み
  useEffect(() => {
    if (!isComponentMounted) return

    const savedCoach = localStorage.getItem("selectedCoach")
    if (savedCoach) {
      setCoachInfo(JSON.parse(savedCoach))
    } else {
      // デフォルトコーチ情報
      setCoachInfo({
        id: 1,
        name: "タケル",
        type: "male",
        src: "/math-coach-avatar.png",
      })
    }

    // スクロール位置の復元
    const savedScrollPositions = localStorage.getItem("talkRoomScrollPositions")
    if (savedScrollPositions) {
      setScrollPositions(JSON.parse(savedScrollPositions))
      setIsFirstVisit(false)
    }

    // ページを離れる時にスクロール位置を保存
    const handleBeforeUnload = () => {
      saveScrollPositions()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isComponentMounted])

  // メッセージが追加されたらスクロール
  useEffect(() => {
    if (!isComponentMounted) return

    if (isFirstVisit) {
      // 初回訪問時は最上部から表示（スクロールなし）
      if (activeTab === "today" && todayChatContainerRef.current) {
        todayChatContainerRef.current.scrollTop = 0
      } else if (activeTab === "week" && weekChatContainerRef.current) {
        weekChatContainerRef.current.scrollTop = 0
      }
      setIsFirstVisit(false)
    } else {
      // メッセージ追加時は最下部にスクロール
      scrollToBottom()
    }
  }, [messages, weeklyMessages, activeTab, isFirstVisit, isComponentMounted])

  // タブ切り替え時にスクロール位置を復元
  useEffect(() => {
    if (!isComponentMounted || isFirstVisit) return

    if (activeTab === "today" && todayChatContainerRef.current) {
      todayChatContainerRef.current.scrollTop = scrollPositions.today
    } else if (activeTab === "week" && weekChatContainerRef.current) {
      weekChatContainerRef.current.scrollTop = scrollPositions.week
    }
  }, [activeTab, isFirstVisit, scrollPositions, isComponentMounted])

  // スクロール位置を保存
  const saveScrollPositions = () => {
    if (!isComponentMounted) return

    const newPositions = { ...scrollPositions }

    if (activeTab === "today" && todayChatContainerRef.current) {
      newPositions.today = todayChatContainerRef.current.scrollTop
    } else if (activeTab === "week" && weekChatContainerRef.current) {
      newPositions.week = weekChatContainerRef.current.scrollTop
    }

    setScrollPositions(newPositions)
    localStorage.setItem("talkRoomScrollPositions", JSON.stringify(newPositions))
  }

  // スクロールイベントハンドラ
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isComponentMounted) return

    if (activeTab === "today") {
      setScrollPositions((prev) => ({ ...prev, today: e.currentTarget.scrollTop }))
    } else {
      setScrollPositions((prev) => ({ ...prev, week: e.currentTarget.scrollTop }))
    }
  }

  const scrollToBottom = () => {
    if (!isComponentMounted) return
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = () => {
    if (!isComponentMounted) return

    const messageContent = selectedQuickReply || message.trim()
    if (!messageContent) return

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: messageContent,
      timestamp: new Date(),
    }

    if (activeTab === "today") {
      setMessages([...messages, newMessage])
      setShowQuickReplies(false)
      setIsComposing(true)

      // コーチからの返信（モック）
      setTimeout(() => {
        let coachReply: Message

        // 返信内容を入力内容に応じて変える
        if (messageContent.includes("集中")) {
          coachReply = {
            id: (Date.now() + 1).toString(),
            sender: "coach",
            content:
              "素晴らしい集中力だね！今日は8問正解できたよ。特に数学の問題の正答率が上がっているよ。明日も同じペースで頑張ろう！",
            timestamp: new Date(),
            badges: ["集中の達人"],
            quickReplies: ["明日も頑張る！", "苦手な問題について相談したい", "今日の学習のコツは？"],
          }
        } else if (messageContent.includes("難しい")) {
          coachReply = {
            id: (Date.now() + 1).toString(),
            sender: "coach",
            content:
              "難しい問題に挑戦したんだね。チャレンジ精神が素晴らしいよ！今日は特に関数の問題で時間がかかっていたみたいだね。明日はその部分を一緒に復習しよう。",
            timestamp: new Date(),
            quickReplies: ["関数の復習方法は？", "明日の学習計画を立てたい", "ありがとう！"],
          }
        } else {
          coachReply = {
            id: (Date.now() + 1).toString(),
            sender: "coach",
            content:
              "振り返りありがとう！今日は15問に取り組んで、8問正解できたね。明日は特に間違えた問題を復習すると効果的だよ。一緒に頑張ろう！",
            timestamp: new Date(),
            quickReplies: ["明日の学習計画は？", "苦手分野を教えて", "ありがとう！"],
          }
        }

        setMessages((prev) => [...prev, coachReply])
        setShowQuickReplies(true)
        setIsComposing(false)
      }, 1000)
    } else {
      setWeeklyMessages([...weeklyMessages, newMessage])
      setShowQuickReplies(false)
      setIsComposing(true)

      // コーチからの返信（モック）- 週次
      setTimeout(() => {
        const coachReply: Message = {
          id: (Date.now() + 1).toString(),
          sender: "coach",
          content: `今週は4日も学習できたんだね！先週より${weeklyStats.improvement}%も完答率が上がっているよ。特に数学の問題で成長が見られるね。来週は特に英語の問題にも挑戦してみよう！`,
          timestamp: new Date(),
          badges: ["週間努力賞", "成長継続中"],
          quickReplies: ["来週の目標を立てたい", "苦手分野の対策は？", "モチベーションを維持するコツは？"],
        }

        setWeeklyMessages((prev) => [...prev, coachReply])
        setShowQuickReplies(true)
        setIsComposing(false)
      }, 1000)
    }

    setMessage("")
    setSelectedQuickReply(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickReplyClick = (reply: string) => {
    if (!isComponentMounted) return

    // 選択肢をクリックしたら即座に送信
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: reply,
      timestamp: new Date(),
    }

    if (activeTab === "today") {
      setMessages([...messages, newMessage])
      setShowQuickReplies(false)
      setIsComposing(true)

      // コーチからの返信（モック）
      setTimeout(() => {
        let coachReply: Message

        // 返信内容を入力内容に応じて変える
        if (reply.includes("集中")) {
          coachReply = {
            id: (Date.now() + 1).toString(),
            sender: "coach",
            content:
              "素晴らしい集中力だね！今日は8問正解できたよ。特に数学の問題の正答率が上がっているよ。明日も同じペースで頑張ろう！",
            timestamp: new Date(),
            badges: ["集中の達人"],
            quickReplies: ["明日も頑張る！", "苦手な問題について相談したい", "今日の学習のコツは？"],
          }
        } else if (reply.includes("難しい")) {
          coachReply = {
            id: (Date.now() + 1).toString(),
            sender: "coach",
            content:
              "難しい問題に挑戦したんだね。チャレンジ精神が素晴らしいよ！今日は特に関数の問題で時間がかかっていたみたいだね。明日はその部分を一緒に復習しよう。",
            timestamp: new Date(),
            quickReplies: ["関数の復習方法は？", "明日の学習計画を立てたい", "ありがとう！"],
          }
        } else {
          coachReply = {
            id: (Date.now() + 1).toString(),
            sender: "coach",
            content:
              "振り返りありがとう！今日は15問に取り組んで、8問正解できたね。明日は特に間違えた問題を復習すると効果的だよ。一緒に頑張ろう！",
            timestamp: new Date(),
            quickReplies: ["明日の学習計画は？", "苦手分野を教えて", "ありがとう！"],
          }
        }

        setMessages((prev) => [...prev, coachReply])
        setShowQuickReplies(true)
        setIsComposing(false)
      }, 1000)
    } else {
      setWeeklyMessages([...weeklyMessages, newMessage])
      setShowQuickReplies(false)
      setIsComposing(true)

      // コーチからの返信（モック）- 週次
      setTimeout(() => {
        const coachReply: Message = {
          id: (Date.now() + 1).toString(),
          sender: "coach",
          content: `今週は4日も学習できたんだね！先週より${weeklyStats.improvement}%も完答率が上がっているよ。特に数学の問題で成長が見られるね。来週は特に英語の問題にも挑戦してみよう！`,
          timestamp: new Date(),
          badges: ["週間努力賞", "成長継続中"],
          quickReplies: ["来週の目標を立てたい", "苦手分野の対策は？", "モチベーションを維持するコツは？"],
        }

        setWeeklyMessages((prev) => [...prev, coachReply])
        setShowQuickReplies(true)
        setIsComposing(false)
      }, 1000)
    }

    setMessage("")
    setSelectedQuickReply(null)
  }

  const handleTabChange = (value: string) => {
    if (!isComponentMounted) return

    // タブ切り替え前にスクロール位置を保存
    saveScrollPositions()
    setActiveTab(value)
  }

  const currentMessages = activeTab === "today" ? messages : weeklyMessages

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Tabs defaultValue="today" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 sticky top-0 z-10 bg-white">
          <TabsTrigger
            value="today"
            className="py-3 text-base font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            今日のトーク
          </TabsTrigger>
          <TabsTrigger
            value="week"
            className="py-3 text-base font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            今週のトーク
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="flex flex-col h-[calc(100vh-14rem)] px-4">
          <div className="flex flex-col h-full overflow-hidden">
            {/* 今日の学習状況カード - 上部に配置 */}
            <Card className="mb-4 overflow-hidden border-0 shadow-md bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="py-3 border-b border-blue-100 bg-white/80">
                <CardTitle className="text-base flex items-center">
                  <div className="bg-blue-500 text-white p-1.5 rounded-md mr-2">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  今日のスパーク
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {/* メインステータス - アニメーション付きカウンター */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-100 transform transition-all hover:scale-105">
                    <p className="text-xs text-gray-500 mb-1">取り組んだ問題数</p>
                    <p className="font-bold text-2xl text-blue-700">
                      {todayStats.problemsAttempted}
                      <span className="text-sm font-normal text-gray-500 ml-1">問</span>
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-100 transform transition-all hover:scale-105">
                    <p className="text-xs text-gray-500 mb-1">完答率</p>
                    <div className="flex items-end">
                      <p className="font-bold text-2xl text-blue-700">
                        {Math.round((todayStats.complete / todayStats.problemsAttempted) * 100)}
                        <span className="text-sm font-normal text-gray-500 ml-1">%</span>
                      </p>
                      <div className="ml-2 text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                        <span>+5%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 問題ステータスの視覚化 - 改良版 */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-100 mb-4">
                  <p className="text-xs text-gray-500 mb-2">問題ステータス</p>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="flex h-full">
                          <div
                            className="bg-green-500 h-full transition-all duration-1000 ease-out"
                            style={{ width: `${(todayStats.complete / todayStats.problemsAttempted) * 100}%` }}
                          ></div>
                          <div
                            className="bg-yellow-500 h-full transition-all duration-1000 ease-out"
                            style={{ width: `${(todayStats.partial / todayStats.problemsAttempted) * 100}%` }}
                          ></div>
                          <div
                            className="bg-red-500 h-full transition-all duration-1000 ease-out"
                            style={{ width: `${(todayStats.incorrect / todayStats.problemsAttempted) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-3 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                        <span>{todayStats.complete}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                        <span>{todayStats.partial}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                        <span>{todayStats.incorrect}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 累積完答数 - アニメーション付きプログレスバー */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-100 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-gray-500">累積完答数</p>
                    <p className="text-xs font-medium">
                      {todayStats.totalComplete}/{todayStats.totalProblems}問
                    </p>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ease-out"
                        style={{ width: `${(todayStats.totalComplete / todayStats.totalProblems) * 100}%` }}
                      ></div>
                    </div>
                    <div className="absolute -bottom-3 left-1/4 w-1 h-3 bg-gray-300"></div>
                    <div className="absolute -bottom-3 left-1/2 w-1 h-3 bg-gray-300"></div>
                    <div className="absolute -bottom-3 left-3/4 w-1 h-3 bg-gray-300"></div>
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] text-gray-500">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* 連続学習日数 - バッジとアニメーション */}
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-lg mr-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">連続学習日数</p>
                      <p className="font-medium text-blue-700">{todayStats.streakDays}日目</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Badge
                      variant="outline"
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-3 py-1"
                    >
                      <span className="animate-pulse mr-1">🔥</span> {todayStats.streakDays}日連続
                    </Badge>
                    {todayStats.streakDays >= 5 && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                        <Award className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* コーチ情報 */}
            {coachInfo && (
              <div className="flex items-center mb-4 p-2 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <Image
                    src={coachInfo.src || "/placeholder.svg?height=40&width=40&query=avatar"}
                    alt={coachInfo.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{coachInfo.name}コーチ</p>
                  <p className="text-xs text-gray-500">今日も一緒に頑張ろう！</p>
                </div>
              </div>
            )}

            {/* チャット部分とメッセージ入力エリアをまとめて一つのコンテナに */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* チャット部分 - 高さを調整して入力欄との距離を縮める */}
              <div
                className="chat-container flex-1 overflow-y-auto p-2 space-y-4 mb-0 border border-gray-100 rounded-t-lg"
                ref={todayChatContainerRef}
                onScroll={handleScroll}
                style={{ maxHeight: "calc(100% - 60px)" }} // 入力欄の高さ分を引く
              >
                {currentMessages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`message-container ${msg.sender === "user" ? "flex justify-end" : "flex justify-start"}`}
                  >
                    <div
                      className={`message max-w-[80%] ${
                        msg.sender === "user"
                          ? "bg-blue-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                          : "bg-gray-100 text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl"
                      } p-3 shadow-sm`}
                    >
                      {msg.sender === "coach" && msg.previousMessage && (
                        <div className="previous-message text-xs text-gray-500 italic mb-2 p-2 bg-gray-50 rounded">
                          {msg.previousMessage}
                        </div>
                      )}

                      <div className="message-content">{msg.content}</div>

                      {msg.badges && msg.badges.length > 0 && (
                        <div className="badges mt-2 flex flex-wrap gap-1">
                          {msg.badges.map((badge, i) => (
                            <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <Award className="h-3 w-3 mr-1" /> {badge}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {msg.quickReplies && showQuickReplies && index === currentMessages.length - 1 && (
                        <div className="quick-replies mt-3 flex flex-wrap gap-2">
                          {msg.quickReplies.map((reply, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className="text-xs py-1 h-auto bg-white hover:bg-blue-50"
                              onClick={() => handleQuickReplyClick(reply)}
                            >
                              {reply}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isComposing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-2xl p-3 max-w-[80%]">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 入力エリア - LINE風のスタイルに変更し、チャット部分とくっつける */}
              <div className="input-container bg-gray-50 p-2 rounded-b-lg border border-gray-200 border-t-0 shadow-sm">
                <div className="flex items-center">
                  <Textarea
                    className="input-field flex-1 min-h-[44px] max-h-[120px] py-2 px-4 resize-none rounded-full bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="メッセージを入力..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={1}
                  />
                  <button
                    className="ml-2 p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSendMessage}
                    disabled={!message.trim() && !selectedQuickReply}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="week" className="flex flex-col h-[calc(100vh-14rem)] px-4">
          <div className="flex flex-col h-full overflow-hidden">
            {/* 今週の学習状況カード - 上部に配置 */}
            <Card className="mb-4 overflow-hidden border-0 shadow-md bg-gradient-to-br from-indigo-50 to-white">
              <CardHeader className="py-3 border-b border-indigo-100 bg-white/80">
                <CardTitle className="text-base flex items-center">
                  <div className="bg-indigo-500 text-white p-1.5 rounded-md mr-2">
                    <Brain className="h-4 w-4" />
                  </div>
                  今週のスパーク
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {/* メインステータス - アニメーション付きカウンター */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100 transform transition-all hover:scale-105">
                    <p className="text-xs text-gray-500 mb-1">学習日数</p>
                    <div className="flex items-end">
                      <p className="font-bold text-2xl text-indigo-700">
                        {weeklyStats.daysStudied}
                        <span className="text-sm font-normal text-gray-500 ml-1">日</span>
                      </p>
                      <p className="text-xs text-gray-500 ml-2 mb-1">/ 7日</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100 transform transition-all hover:scale-105">
                    <p className="text-xs text-gray-500 mb-1">取り組んだ問題数</p>
                    <p className="font-bold text-2xl text-indigo-700">
                      {weeklyStats.problemsAttempted}
                      <span className="text-sm font-normal text-gray-500 ml-1">問</span>
                    </p>
                  </div>
                </div>

                {/* 今週の完答率 - 改良版 */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-500">今週の完答率</p>
                    <div className="flex items-center text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-full">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+{weeklyStats.improvement}%</span>
                    </div>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex items-center mb-2">
                      <div className="w-full bg-gray-100 rounded-full h-3 mr-2">
                        <div
                          className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${weeklyStats.weeklyCompleteRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-indigo-700">{weeklyStats.weeklyCompleteRate}%</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-300 mr-1"></div>
                        <span>先週: {weeklyStats.lastWeekRate}%</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mr-1"></div>
                        <span>今週: {weeklyStats.weeklyCompleteRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 累積完答数 - アニメーション付きプログレスバー */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-gray-500">累積完答数</p>
                    <p className="text-xs font-medium">
                      {weeklyStats.totalComplete}問 ({weeklyStats.totalCompleteRate}%)
                    </p>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
                      <div
                        className="bg-gradient-to-r from-indigo-400 to-indigo-600 shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ease-out"
                        style={{ width: `${weeklyStats.totalCompleteRate}%` }}
                      ></div>
                    </div>
                    <div className="absolute -bottom-3 left-1/4 w-1 h-3 bg-gray-300"></div>
                    <div className="absolute -bottom-3 left-1/2 w-1 h-3 bg-gray-300"></div>
                    <div className="absolute -bottom-3 left-3/4 w-1 h-3 bg-gray-300"></div>
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] text-gray-500">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* 今週の成果 - バッジとアニメーション */}
                <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl border border-indigo-100">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-1.5 rounded-lg mr-2">
                      <Award className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">今週の成果</p>
                      <p className="font-medium text-indigo-700">目標達成中</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge
                      variant="outline"
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0 px-3 py-1"
                    >
                      <span className="animate-pulse mr-1">⭐</span> 継続の達人
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-gradient-to-r from-purple-400 to-purple-500 text-white border-0 px-3 py-1"
                    >
                      <span className="animate-pulse mr-1">📈</span> 成長中
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* コーチ情報 */}
            {coachInfo && (
              <div className="flex items-center mb-4 p-2 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <Image
                    src={coachInfo.src || "/placeholder.svg?height=40&width=40&query=avatar"}
                    alt={coachInfo.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{coachInfo.name}コーチ</p>
                  <p className="text-xs text-gray-500">今週の振り返りをしよう！</p>
                </div>
              </div>
            )}

            {/* チャット部分とメッセージ入力エリアをまとめて一つのコンテナに */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* チャット部分 - 高さを調整して入力欄との距離を縮める */}
              <div
                className="chat-container flex-1 overflow-y-auto p-2 space-y-4 mb-0 border border-gray-100 rounded-t-lg"
                ref={weekChatContainerRef}
                onScroll={handleScroll}
                style={{ maxHeight: "calc(100% - 60px)" }} // 入力欄の高さ分を引く
              >
                {currentMessages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`message-container ${msg.sender === "user" ? "flex justify-end" : "flex justify-start"}`}
                  >
                    <div
                      className={`message max-w-[80%] ${
                        msg.sender === "user"
                          ? "bg-blue-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                          : "bg-gray-100 text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl"
                      } p-3 shadow-sm`}
                    >
                      {msg.sender === "coach" && msg.previousMessage && (
                        <div className="previous-message text-xs text-gray-500 italic mb-2 p-2 bg-gray-50 rounded">
                          {msg.previousMessage}
                        </div>
                      )}

                      <div className="message-content">{msg.content}</div>

                      {msg.badges && msg.badges.length > 0 && (
                        <div className="badges mt-2 flex flex-wrap gap-1">
                          {msg.badges.map((badge, i) => (
                            <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <Award className="h-3 w-3 mr-1" /> {badge}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {msg.quickReplies && showQuickReplies && index === currentMessages.length - 1 && (
                        <div className="quick-replies mt-3 flex flex-wrap gap-2">
                          {msg.quickReplies.map((reply, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className="text-xs py-1 h-auto bg-white hover:bg-blue-50"
                              onClick={() => handleQuickReplyClick(reply)}
                            >
                              {reply}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isComposing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-2xl p-3 max-w-[80%]">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 入力エリア - LINE風のスタイルに変更し、チャット部分とくっつける */}
              <div className="input-container bg-gray-50 p-2 rounded-b-lg border border-gray-200 border-t-0 shadow-sm">
                <div className="flex items-center">
                  <Textarea
                    className="input-field flex-1 min-h-[44px] max-h-[120px] py-2 px-4 resize-none rounded-full bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="メッセージを入力..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={1}
                  />
                  <button
                    className="ml-2 p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSendMessage}
                    disabled={!message.trim() && !selectedQuickReply}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TalkRoom
