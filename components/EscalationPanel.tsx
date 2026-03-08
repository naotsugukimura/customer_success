"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, PhoneCall, MessageSquareText, CheckCircle2 } from "lucide-react"

type EscalationChoice = "phone" | "callback" | "feedback" | null

interface EscalationPanelProps {
  onChoosePhone: () => void
  onChooseCallback: (name: string, phone: string) => void
  onChooseFeedback: () => void
}

export function EscalationPanel({
  onChoosePhone,
  onChooseCallback,
  onChooseFeedback,
}: EscalationPanelProps) {
  const [choice, setChoice] = useState<EscalationChoice>(null)
  const [callbackName, setCallbackName] = useState("")
  const [callbackPhone, setCallbackPhone] = useState("")
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="mx-auto max-w-sm rounded-xl border border-green-200 bg-green-50 p-4 text-center">
        <CheckCircle2 className="mx-auto mb-2 size-8 text-green-600" />
        <p className="text-sm font-medium text-green-800">
          折り返しのご連絡を承りました
        </p>
        <p className="mt-1 text-xs text-green-600">
          担当者より順次ご連絡いたします
        </p>
      </div>
    )
  }

  if (choice === "callback") {
    return (
      <div className="mx-auto max-w-sm space-y-3 rounded-xl border bg-background p-4">
        <p className="text-sm font-medium">折り返し連絡の予約</p>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">お名前</label>
          <Input
            placeholder="例：山田太郎"
            value={callbackName}
            onChange={(e) => setCallbackName(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">電話番号</label>
          <Input
            placeholder="例：090-1234-5678"
            type="tel"
            value={callbackPhone}
            onChange={(e) => setCallbackPhone(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setChoice(null)}
          >
            戻る
          </Button>
          <Button
            size="sm"
            className="flex-1"
            disabled={!callbackName.trim() || !callbackPhone.trim()}
            onClick={() => {
              onChooseCallback(callbackName.trim(), callbackPhone.trim())
              setSubmitted(true)
            }}
          >
            予約する
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm space-y-2 rounded-xl border bg-background p-4">
      <p className="text-sm font-medium">
        お力になれず申し訳ございません。どのようにサポートしましょうか？
      </p>
      <button
        onClick={() => {
          onChoosePhone()
        }}
        className="flex w-full items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-left transition-colors hover:bg-green-100"
      >
        <Phone className="size-5 text-green-600" />
        <div>
          <p className="text-sm font-medium text-green-800">今すぐ電話で相談する</p>
          <p className="text-xs text-green-600">0120-00-0000（通話無料）</p>
        </div>
      </button>

      <button
        onClick={() => setChoice("callback")}
        className="flex w-full items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left transition-colors hover:bg-blue-100"
      >
        <PhoneCall className="size-5 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-blue-800">折り返し連絡を希望する</p>
          <p className="text-xs text-blue-600">担当者から折り返しお電話します</p>
        </div>
      </button>

      <button
        onClick={onChooseFeedback}
        className="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted"
      >
        <MessageSquareText className="size-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">改善要望だけ送る</p>
          <p className="text-xs text-muted-foreground">ご意見を開発チームに届けます</p>
        </div>
      </button>
    </div>
  )
}
