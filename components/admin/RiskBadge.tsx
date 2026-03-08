import { Badge } from "@/components/ui/badge"
import type { ChurnRisk } from "@/lib/types"

const RISK_CONFIG: Record<ChurnRisk, { label: string; className: string }> = {
  high: {
    label: "高",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  medium: {
    label: "中",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  low: {
    label: "低",
    className: "border-green-200 bg-green-50 text-green-700",
  },
}

interface RiskBadgeProps {
  risk: ChurnRisk
}

export function RiskBadge({ risk }: RiskBadgeProps) {
  const config = RISK_CONFIG[risk]
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
