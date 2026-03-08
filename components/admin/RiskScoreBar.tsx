import { cn } from "@/lib/utils"

interface RiskScoreBarProps {
  score: number
}

export function RiskScoreBar({ score }: RiskScoreBarProps) {
  const color =
    score >= 60
      ? "bg-red-500"
      : score >= 30
        ? "bg-amber-500"
        : "bg-green-500"

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums">{score}</span>
    </div>
  )
}
