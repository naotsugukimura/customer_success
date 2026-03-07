"use client"

import { Badge } from "@/components/ui/badge"
import type { Feedback } from "@/lib/types"
import { ArrowUpDown } from "lucide-react"

interface FeedbackTableProps {
  feedbacks: Feedback[]
  sortKey: string
  sortDir: "asc" | "desc"
  onSort: (key: string) => void
  onSelect: (fb: Feedback) => void
  selectedId: string | null
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function emotionBadgeColor(emotion: string | null) {
  switch (emotion) {
    case "困った":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "不安":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "諦めた":
      return "bg-red-100 text-red-800 border-red-200"
    case "わからない":
      return "bg-purple-100 text-purple-800 border-purple-200"
    default:
      return ""
  }
}

const COLUMNS = [
  { key: "created_at", label: "日時", width: "w-[90px]" },
  { key: "user_intent", label: "操作内容", width: "flex-1 min-w-[140px]" },
  { key: "resolved", label: "状態", width: "w-[80px]" },
  { key: "emotion", label: "感情", width: "w-[90px]" },
  { key: "stuck_point", label: "詰まりポイント", width: "flex-1 min-w-[120px] hidden md:flex" },
]

export function FeedbackTable({
  feedbacks,
  sortKey,
  sortDir,
  onSort,
  onSelect,
  selectedId,
}: FeedbackTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      {/* Header */}
      <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
        {COLUMNS.map((col) => (
          <button
            key={col.key}
            className={`flex items-center gap-1 ${col.width}`}
            onClick={() => onSort(col.key)}
          >
            {col.label}
            {sortKey === col.key && (
              <ArrowUpDown className="size-3" />
            )}
          </button>
        ))}
      </div>

      {/* Rows */}
      <div className="max-h-[420px] overflow-y-auto">
        {feedbacks.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            該当するフィードバックがありません
          </div>
        ) : (
          feedbacks.map((fb) => (
            <button
              key={fb.id}
              className={`flex w-full items-center gap-2 border-b px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent/50 ${
                selectedId === fb.id ? "bg-accent" : ""
              }`}
              onClick={() => onSelect(fb)}
            >
              <span className="w-[90px] shrink-0 text-xs text-muted-foreground">
                {formatDate(fb.created_at)}
              </span>
              <span className="flex-1 min-w-[140px] truncate">{fb.user_intent}</span>
              <span className="w-[80px] shrink-0">
                {fb.resolved ? (
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 text-xs">
                    解決
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 text-xs">
                    未解決
                  </Badge>
                )}
              </span>
              <span className="w-[90px] shrink-0">
                {fb.emotion && (
                  <Badge variant="outline" className={`text-xs ${emotionBadgeColor(fb.emotion)}`}>
                    {fb.emotion}
                  </Badge>
                )}
              </span>
              <span className="hidden flex-1 min-w-[120px] truncate text-xs text-muted-foreground md:block">
                {fb.stuck_point ?? "—"}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
