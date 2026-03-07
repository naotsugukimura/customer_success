import { Card, CardContent } from "@/components/ui/card"
import {
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Frown,
} from "lucide-react"
import type { FeedbackStats } from "@/lib/mock-data"

interface StatCardsProps {
  stats: FeedbackStats
}

export function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      label: "総問い合わせ数",
      value: stats.total,
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "未解決",
      value: stats.unresolved,
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "解決済み",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "感情「困った」",
      value: stats.emotionCounts["困った"] ?? 0,
      icon: Frown,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="py-4">
          <CardContent className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${c.bg}`}>
              <c.icon className={`size-5 ${c.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
