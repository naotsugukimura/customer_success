import { Card, CardContent } from "@/components/ui/card"
import { Building2, AlertTriangle, UserX, TrendingUp } from "lucide-react"
import type { ChurnStats } from "@/lib/types"

interface ChurnStatCardsProps {
  stats: ChurnStats
}

export function ChurnStatCards({ stats }: ChurnStatCardsProps) {
  const cards = [
    {
      label: "監視対象事業所",
      value: stats.totalOffices,
      sub: `体験中 ${stats.trialOffices} / 契約中 ${stats.activeOffices}`,
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "高リスク",
      value: stats.highRiskCount,
      sub: `中リスク ${stats.mediumRiskCount}件`,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "未ログイン体験者",
      value: stats.neverLoggedInCount,
      sub: "体験開始後ログインなし",
      icon: UserX,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "体験→契約率",
      value: `${stats.trialConversionRate}%`,
      sub: `平均リスクスコア ${stats.averageRiskScore}`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="py-4">
          <CardContent className="flex items-center gap-3">
            <div className={`shrink-0 rounded-lg p-2 ${c.bg}`}>
              <c.icon className={`size-5 ${c.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                {c.sub}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
