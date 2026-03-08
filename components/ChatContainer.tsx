"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "./MessageBubble"
import { ResolutionPrompt } from "./ResolutionPrompt"
import { FeedbackForm } from "./FeedbackForm"
import { EscalationPanel } from "./EscalationPanel"
import { TypingIndicator } from "./TypingIndicator"
import {
  GREETING_MESSAGE,
  COMPLETION_RESOLVED_MESSAGE,
  COMPLETION_FEEDBACK_MESSAGE,
  TASK_MENU,
} from "@/lib/constants"
import type {
  ChatMessage,
  ConversationPhase,
  FeedbackFormData,
} from "@/lib/types"
import { MessageSquare, Send, RotateCcw } from "lucide-react"

export function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [phase, setPhase] = useState<ConversationPhase>("greeting")
  const [sessionId] = useState(() => uuidv4())
  const [userIntent, setUserIntent] = useState("")
  const [botAnswer, setBotAnswer] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isStreaming, phase])

  useEffect(() => {
    const greeting: ChatMessage = {
      role: "assistant",
      content: GREETING_MESSAGE,
      timestamp: new Date().toISOString(),
      metadata: { phase: "greeting" },
    }
    setMessages([greeting])
    setPhase("hearing")
  }, [])

  const addMessage = useCallback(
    (role: "user" | "assistant", content: string, msgPhase: ConversationPhase) => {
      const msg: ChatMessage = {
        role,
        content,
        timestamp: new Date().toISOString(),
        metadata: { phase: msgPhase },
      }
      setMessages((prev) => [...prev, msg])
      return msg
    },
    []
  )

  const streamChatResponse = useCallback(
    async (allMessages: ChatMessage[]) => {
      setIsStreaming(true)
      let fullText = ""

      try {
        const apiMessages = allMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content }))

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, sessionId }),
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || "API通信エラー")
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error("ストリーム取得に失敗しました")

        const decoder = new TextDecoder()
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          metadata: { phase: "guidance" },
        }
        setMessages((prev) => [...prev, assistantMsg])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const data = line.slice(6)

            if (data === "[DONE]") continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.error) throw new Error(parsed.error)
              if (parsed.text) {
                fullText += parsed.text
                setMessages((prev) => {
                  const updated = [...prev]
                  const last = updated[updated.length - 1]
                  if (last.role === "assistant") {
                    updated[updated.length - 1] = { ...last, content: fullText }
                  }
                  return updated
                })
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "通信エラーが発生しました"
        fullText = `申し訳ございません。${errorMessage}\n再度お試しください。`
        addMessage("assistant", fullText, "guidance")
      } finally {
        setIsStreaming(false)
        setBotAnswer(fullText)
        setPhase("resolution")
      }
    },
    [sessionId, addMessage]
  )

  const handleSendMessage = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return

    setInput("")

    if (phase === "hearing" || phase === "guidance" || phase === "resolution") {
      if (!userIntent) setUserIntent(trimmed)
      const userMsg = addMessage("user", trimmed, "hearing")
      const updatedMessages = [...messages, userMsg]
      setPhase("guidance")
      await streamChatResponse(updatedMessages)
    }
  }, [input, isStreaming, phase, messages, addMessage, streamChatResponse, userIntent])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleResolve = async (resolved: boolean) => {
    if (resolved) {
      addMessage("assistant", COMPLETION_RESOLVED_MESSAGE, "completed")
      setPhase("completed")

      await saveFeedback({
        resolved: true,
        stuck_point: null,
        desired_behavior: null,
        emotion: null,
      })
    } else {
      setPhase("escalation")
    }
  }

  const handleEscalationPhone = () => {
    addMessage(
      "assistant",
      "お電話でのご相談をご希望ですね。\nお客様相談窓口: 0120-00-0000（通話無料）\n平日 9:00〜20:30 / 土日祝 9:00〜17:30",
      "completed"
    )
    setPhase("completed")
    saveFeedback({
      resolved: false,
      stuck_point: "電話相談を希望",
      desired_behavior: null,
      emotion: null,
    })
  }

  const handleEscalationCallback = (name: string, phone: string) => {
    addMessage(
      "assistant",
      `${name}様、折り返しのご連絡を承りました。\n担当者より ${phone} へお電話いたします。`,
      "completed"
    )
    setPhase("completed")
    saveFeedback({
      resolved: false,
      stuck_point: `折返し希望: ${name} / ${phone}`,
      desired_behavior: null,
      emotion: null,
    })
  }

  const handleEscalationFeedback = () => {
    setPhase("voc_collection")
  }

  const handleFeedbackSubmit = async (data: FeedbackFormData) => {
    addMessage("assistant", COMPLETION_FEEDBACK_MESSAGE, "completed")
    setPhase("completed")

    await saveFeedback({
      resolved: false,
      stuck_point: data.stuck_point,
      desired_behavior: data.desired_behavior,
      emotion: data.emotion,
    })
  }

  const saveFeedback = async (extra: {
    resolved: boolean
    stuck_point: string | null
    desired_behavior: string | null
    emotion: string | null
  }) => {
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: uuidv4(),
          created_at: new Date().toISOString(),
          session_id: sessionId,
          user_intent: userIntent,
          bot_answer: botAnswer,
          resolved: extra.resolved,
          stuck_point: extra.stuck_point,
          desired_behavior: extra.desired_behavior,
          emotion: extra.emotion,
          full_conversation: messages,
        }),
      })
    } catch (error) {
      console.error("Feedback save error:", error)
    }
  }

  const handleReset = () => {
    setMessages([])
    setInput("")
    setPhase("greeting")
    setUserIntent("")
    setBotAnswer("")

    setTimeout(() => {
      const greeting: ChatMessage = {
        role: "assistant",
        content: GREETING_MESSAGE,
        timestamp: new Date().toISOString(),
        metadata: { phase: "greeting" },
      }
      setMessages([greeting])
      setPhase("hearing")
    }, 100)
  }

  const handleTaskClick = (query: string) => {
    if (!query) {
      // 「その他」: 入力欄にフォーカスするだけ
      inputRef.current?.focus()
      return
    }
    setInput(query)
    // 自動送信: 入力をセットしてから次のtickで送信
    setTimeout(() => {
      setInput("")
      setUserIntent(query)
      const userMsg = addMessage("user", query, "hearing")
      const updatedMessages = [...messages, userMsg]
      setPhase("guidance")
      streamChatResponse(updatedMessages)
    }, 50)
  }

  const showInput = phase === "hearing" || phase === "guidance" || phase === "resolution"
  const showResolution = phase === "resolution" && !isStreaming
  const showEscalation = phase === "escalation"
  const showFeedbackForm = phase === "voc_collection"
  const showReset = phase === "completed"
  const showSamples = phase === "hearing" && messages.length <= 1

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b bg-primary px-4 py-3 text-primary-foreground">
        <MessageSquare className="size-5" />
        <div>
          <p className="text-sm font-bold">操作サポートチャット</p>
          <p className="text-xs opacity-80">あゆみ請求</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {isStreaming && messages[messages.length - 1]?.content === "" && (
            <TypingIndicator />
          )}

          {showResolution && <ResolutionPrompt onResolve={handleResolve} />}

          {showEscalation && (
            <EscalationPanel
              onChoosePhone={handleEscalationPhone}
              onChooseCallback={handleEscalationCallback}
              onChooseFeedback={handleEscalationFeedback}
            />
          )}

          {showFeedbackForm && (
            <FeedbackForm onSubmit={handleFeedbackSubmit} />
          )}

          {showReset && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                新しい相談を始める
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Task menu */}
      {showSamples && (
        <div className="shrink-0 border-t px-4 py-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            今日はどんな作業をしますか？
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TASK_MENU.map((item) => (
              <button
                key={item.label}
                onClick={() => handleTaskClick(item.query)}
                className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent hover:border-primary/30"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      {showInput && (
        <div className="shrink-0 border-t px-4 py-3">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="操作でお困りのことを入力してください..."
              className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/30"
              rows={1}
              disabled={isStreaming}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isStreaming}
              size="icon"
              className="shrink-0"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
