"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { EMOTIONS } from "@/lib/constants"
import type { Emotion, FeedbackFormData } from "@/lib/types"
import { Send } from "lucide-react"

interface FeedbackFormProps {
  onSubmit: (data: FeedbackFormData) => void
  disabled?: boolean
}

export function FeedbackForm({ onSubmit, disabled }: FeedbackFormProps) {
  const [stuckPoint, setStuckPoint] = useState("")
  const [desiredBehavior, setDesiredBehavior] = useState("")
  const [emotion, setEmotion] = useState<Emotion | "">("")

  const canSubmit = stuckPoint.trim() && desiredBehavior.trim() && emotion

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit({
      stuck_point: stuckPoint.trim(),
      desired_behavior: desiredBehavior.trim(),
      emotion: emotion as Emotion,
    })
  }

  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-4 max-w-[90%] w-full space-y-4">
        <p className="text-sm font-medium">
          改善のために、もう少し教えていただけますか？
        </p>

        <div className="space-y-2">
          <Label htmlFor="stuck-point" className="text-xs text-muted-foreground">
            1. どの操作で詰まりましたか？
          </Label>
          <Textarea
            id="stuck-point"
            placeholder="例：請求書の出力画面で、対象月を選択した後の手順がわからなかった"
            value={stuckPoint}
            onChange={(e) => setStuckPoint(e.target.value)}
            disabled={disabled}
            rows={2}
            className="text-sm bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desired-behavior" className="text-xs text-muted-foreground">
            2. どうなってほしかったですか？
          </Label>
          <Textarea
            id="desired-behavior"
            placeholder="例：ボタンを押したら自動的にPDFが生成されてほしい"
            value={desiredBehavior}
            onChange={(e) => setDesiredBehavior(e.target.value)}
            disabled={disabled}
            rows={2}
            className="text-sm bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            3. 今の気持ちを教えてください
          </Label>
          <RadioGroup
            value={emotion}
            onValueChange={(v) => setEmotion(v as Emotion)}
            disabled={disabled}
            className="grid grid-cols-2 gap-2"
          >
            {EMOTIONS.map((e) => (
              <div key={e.value} className="flex items-center gap-2">
                <RadioGroupItem value={e.value} id={`emotion-${e.value}`} />
                <Label htmlFor={`emotion-${e.value}`} className="text-sm font-normal cursor-pointer">
                  {e.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || disabled}
          className="w-full gap-1.5"
          size="sm"
        >
          <Send className="size-3.5" />
          送信する
        </Button>
      </div>
    </div>
  )
}
