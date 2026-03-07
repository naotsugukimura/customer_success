import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface ResolutionPromptProps {
  onResolve: (resolved: boolean) => void
  disabled?: boolean
}

export function ResolutionPrompt({ onResolve, disabled }: ResolutionPromptProps) {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%]">
        <p className="mb-3 text-sm font-medium">お役に立てましたか？</p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => onResolve(true)}
            disabled={disabled}
            className="gap-1.5"
          >
            <ThumbsUp className="size-3.5" />
            はい
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onResolve(false)}
            disabled={disabled}
            className="gap-1.5"
          >
            <ThumbsDown className="size-3.5" />
            いいえ
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          下の入力欄から続けて質問することもできます
        </p>
      </div>
    </div>
  )
}
