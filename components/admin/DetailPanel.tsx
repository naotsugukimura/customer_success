"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Feedback } from "@/lib/types"
import { X, MessageSquare } from "lucide-react"

interface DetailPanelProps {
  feedback: Feedback | null
  onClose: () => void
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export function DetailPanel({ feedback, onClose }: DetailPanelProps) {
  if (!feedback) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-background shadow-xl animate-in slide-in-from-right-full duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-primary" />
          <h3 className="text-sm font-bold">フィードバック詳細</h3>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%-52px)]">
        <div className="space-y-5 p-4">
          {/* Meta */}
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={
                feedback.resolved
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }
            >
              {feedback.resolved ? "解決" : "未解決"}
            </Badge>
            {feedback.emotion && (
              <Badge variant="secondary">{feedback.emotion}</Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDateTime(feedback.created_at)}
            </span>
          </div>

          <Section label="ユーザーの操作意図">
            {feedback.user_intent}
          </Section>

          <Section label="ボットの回答">
            <div className="rounded-md bg-muted/50 p-3 text-xs leading-relaxed">
              {feedback.bot_answer}
            </div>
          </Section>

          {!feedback.resolved && (
            <>
              <Section label="詰まったポイント">
                <span className="text-red-700">{feedback.stuck_point}</span>
              </Section>

              <Section label="こうなってほしかった">
                <span className="text-blue-700">{feedback.desired_behavior}</span>
              </Section>
            </>
          )}

          {/* Conversation Log */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              会話ログ
            </p>
            <div className="space-y-2">
              {feedback.full_conversation.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-2.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "ml-4 bg-primary/10"
                      : "mr-4 bg-muted"
                  }`}
                >
                  <p className="mb-0.5 font-medium text-muted-foreground">
                    {msg.role === "user" ? "ユーザー" : "ボット"}
                  </p>
                  {msg.content}
                </div>
              ))}
            </div>
          </div>

          {/* Session Info */}
          <div className="rounded-md border p-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              セッション情報
            </p>
            <p className="break-all text-xs text-muted-foreground">
              ID: {feedback.session_id}
            </p>
            <p className="text-xs text-muted-foreground">
              FB ID: {feedback.id}
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
