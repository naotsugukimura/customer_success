import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/types"
import { Bot, User } from "lucide-react"

interface MessageBubbleProps {
  message: ChatMessage
}

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <li key={i} className="ml-4 list-disc">
          {renderBold(line.slice(2))}
        </li>
      )
    }
    if (line.match(/^\d+\.\s/)) {
      return (
        <li key={i} className="ml-4 list-decimal">
          {renderBold(line.replace(/^\d+\.\s/, ""))}
        </li>
      )
    }
    if (line.trim() === "") {
      return <br key={i} />
    }
    return (
      <p key={i} className="leading-relaxed">
        {renderBold(line)}
      </p>
    )
  })
}

function renderBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Bot className="size-4" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}
      >
        {isUser ? (
          <p className="leading-relaxed">{message.content}</p>
        ) : (
          <div className="space-y-1">{renderContent(message.content)}</div>
        )}
      </div>
      {isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
          <User className="size-4" />
        </div>
      )}
    </div>
  )
}
