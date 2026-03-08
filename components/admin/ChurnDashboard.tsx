"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChurnStatCards } from "./ChurnStatCards"
import { ChurnAlertBanner } from "./ChurnAlertBanner"
import { ChurnRiskTable } from "./ChurnRiskTable"
import { OfficeDetailPanel } from "./OfficeDetailPanel"
import { MOCK_OFFICES, calcChurnStats } from "@/lib/churn-mock-data"
import type { Office } from "@/lib/types"
import { Shield, Search } from "lucide-react"

type SortKey = "name" | "serviceType" | "status" | "churnRisk" | "lastLoginDate" | "riskScore"

const RISK_ORDER = { high: 0, medium: 1, low: 2 }
const STATUS_ORDER = { inactive: 0, trial: 1, active: 2 }

export function ChurnDashboard() {
  const [search, setSearch] = useState("")
  const [riskFilter, setRiskFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("riskScore")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [selected, setSelected] = useState<Office | null>(null)

  const stats = useMemo(() => calcChurnStats(MOCK_OFFICES), [])

  const filtered = useMemo(() => {
    let data = [...MOCK_OFFICES]

    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.serviceType.toLowerCase().includes(q) ||
          o.prefecture.toLowerCase().includes(q)
      )
    }

    if (riskFilter !== "all") {
      data = data.filter((o) => o.churnRisk === riskFilter)
    }

    if (statusFilter !== "all") {
      data = data.filter((o) => o.status === statusFilter)
    }

    data.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "riskScore":
          cmp = a.riskScore - b.riskScore
          break
        case "churnRisk":
          cmp = RISK_ORDER[a.churnRisk] - RISK_ORDER[b.churnRisk]
          break
        case "status":
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
          break
        case "lastLoginDate": {
          const aDate = a.lastLoginDate ? new Date(a.lastLoginDate).getTime() : 0
          const bDate = b.lastLoginDate ? new Date(b.lastLoginDate).getTime() : 0
          cmp = aDate - bDate
          break
        }
        default:
          cmp = String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? ""))
      }
      return sortDir === "asc" ? cmp : -cmp
    })

    return data
  }, [search, riskFilter, statusFilter, sortKey, sortDir])

  const handleSort = (key: string) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key as SortKey)
      setSortDir("desc")
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 lg:p-6">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Shield className="size-5 text-primary" />
        <h1 className="text-lg font-bold">解約リスク検知</h1>
      </div>

      {/* Alert Banner */}
      <ChurnAlertBanner offices={MOCK_OFFICES} onViewDetail={setSelected} />

      {/* Stats */}
      <ChurnStatCards stats={stats} />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="事業所名で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="リスクレベル" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのリスク</SelectItem>
            <SelectItem value="high">高リスク</SelectItem>
            <SelectItem value="medium">中リスク</SelectItem>
            <SelectItem value="low">低リスク</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="trial">体験中</SelectItem>
            <SelectItem value="active">契約中</SelectItem>
            <SelectItem value="inactive">休止中</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">
          {filtered.length} 件の事業所
        </p>
        <ChurnRiskTable
          offices={filtered}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onSelect={setSelected}
          selectedId={selected?.id ?? null}
        />
      </div>

      {/* Detail Panel */}
      {selected && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setSelected(null)}
          />
          <OfficeDetailPanel office={selected} onClose={() => setSelected(null)} />
        </>
      )}
    </div>
  )
}
