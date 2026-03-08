"use client"

import { useState } from "react"
import { AlertTriangle, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Office } from "@/lib/types"

interface ChurnAlertBannerProps {
  offices: Office[]
  onViewDetail: (office: Office) => void
}

export function ChurnAlertBanner({ offices, onViewDetail }: ChurnAlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const critical = offices
    .filter((o) => o.riskScore >= 80 && !dismissed.has(o.id))
    .sort((a, b) => b.riskScore - a.riskScore)

  if (critical.length === 0) return null

  const visible = critical.slice(0, 3)
  const overflow = critical.length - visible.length

  return (
    <div className="space-y-2">
      {visible.map((office) => (
        <div
          key={office.id}
          className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="size-4 text-red-600 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-red-800">
              {office.name}
              <span className="ml-2 text-xs font-normal text-red-600">
                スコア {office.riskScore}
              </span>
            </p>
            <p className="truncate text-xs text-red-600">
              {office.riskFactors[0]}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-red-700 hover:bg-red-100 hover:text-red-800"
            onClick={() => onViewDetail(office)}
          >
            対応する
            <ChevronRight className="ml-1 size-3.5" />
          </Button>
          <button
            onClick={() =>
              setDismissed((prev) => new Set(prev).add(office.id))
            }
            className="shrink-0 rounded p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
      {overflow > 0 && (
        <p className="text-center text-xs text-red-500">
          他 {overflow} 件の緊急対応が必要な事業所があります
        </p>
      )}
    </div>
  )
}
