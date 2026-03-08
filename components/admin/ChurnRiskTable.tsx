"use client"

import { ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { RiskBadge } from "./RiskBadge"
import { RiskScoreBar } from "./RiskScoreBar"
import type { Office, OfficeStatus } from "@/lib/types"

interface ChurnRiskTableProps {
  offices: Office[]
  sortKey: string
  sortDir: "asc" | "desc"
  onSort: (key: string) => void
  onSelect: (office: Office) => void
  selectedId: string | null
}

const STATUS_CONFIG: Record<OfficeStatus, { label: string; className: string }> = {
  trial: {
    label: "体験中",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  active: {
    label: "契約中",
    className: "border-green-200 bg-green-50 text-green-700",
  },
  inactive: {
    label: "休止中",
    className: "border-gray-200 bg-gray-50 text-gray-700",
  },
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function daysAgoText(iso: string | null): string {
  if (!iso) return "未ログイン"
  const now = new Date("2026-03-08")
  const d = new Date(iso)
  const days = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return "今日"
  if (days === 1) return "昨日"
  return `${days}日前`
}

export function ChurnRiskTable({
  offices,
  sortKey,
  sortDir,
  onSort,
  onSelect,
  selectedId,
}: ChurnRiskTableProps) {
  const columns = [
    { key: "name", label: "事業所名", className: "flex-1 min-w-[140px]" },
    { key: "serviceType", label: "サービス種別", className: "w-[140px] hidden lg:flex" },
    { key: "status", label: "ステータス", className: "w-[80px]" },
    { key: "churnRisk", label: "リスク", className: "w-[60px]" },
    { key: "lastLoginDate", label: "最終ログイン", className: "w-[100px] hidden md:flex" },
    { key: "riskScore", label: "スコア", className: "w-[110px]" },
  ]

  return (
    <div className="overflow-hidden rounded-lg border">
      {/* Header */}
      <div className="flex items-center bg-muted/30 px-3 py-2">
        {columns.map((col) => (
          <button
            key={col.key}
            onClick={() => onSort(col.key)}
            className={`flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground ${col.className}`}
          >
            {col.label}
            {sortKey === col.key && (
              <ArrowUpDown className="size-3 text-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Rows */}
      <div>
        {offices.map((office) => {
          const sc = STATUS_CONFIG[office.status]
          return (
            <button
              key={office.id}
              onClick={() => onSelect(office)}
              className={`flex w-full items-center border-t px-3 py-2.5 text-left transition-colors hover:bg-accent/50 ${
                selectedId === office.id ? "bg-accent" : ""
              }`}
            >
              {/* Name */}
              <div className="flex-1 min-w-[140px]">
                <p className="text-sm font-medium">{office.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {office.prefecture}
                </p>
              </div>

              {/* Service Type */}
              <div className="hidden w-[140px] lg:flex">
                <span className="truncate text-xs text-muted-foreground">
                  {office.serviceType}
                </span>
              </div>

              {/* Status */}
              <div className="w-[80px]">
                <Badge variant="outline" className={`text-[10px] ${sc.className}`}>
                  {sc.label}
                </Badge>
              </div>

              {/* Risk */}
              <div className="w-[60px]">
                <RiskBadge risk={office.churnRisk} />
              </div>

              {/* Last Login */}
              <div className="hidden w-[100px] md:flex md:flex-col">
                <span className="text-xs">{formatDate(office.lastLoginDate)}</span>
                <span className="text-[10px] text-muted-foreground">
                  {daysAgoText(office.lastLoginDate)}
                </span>
              </div>

              {/* Score */}
              <div className="w-[110px]">
                <RiskScoreBar score={office.riskScore} />
              </div>
            </button>
          )
        })}

        {offices.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            該当する事業所はありません
          </div>
        )}
      </div>
    </div>
  )
}
