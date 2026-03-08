"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { StatCards } from "./StatCards"
import { FilterBar } from "./FilterBar"
import { FeedbackTable } from "./FeedbackTable"
import { DetailPanel } from "./DetailPanel"
import { AlertBanner } from "./AlertBanner"
import { ChurnDashboard } from "./ChurnDashboard"
import { MOCK_FEEDBACKS, calcStats } from "@/lib/mock-data"
import type { Feedback } from "@/lib/types"
import { Download, BarChart3, MessageSquare, Shield } from "lucide-react"

const SUB_TABS = [
  { id: "voc", label: "VoC分析", icon: MessageSquare },
  { id: "churn", label: "解約リスク検知", icon: Shield },
] as const

type SubTabId = (typeof SUB_TABS)[number]["id"]
type SortKey = "created_at" | "user_intent" | "resolved" | "emotion" | "stuck_point"

export function AdminDashboard() {
  const [subTab, setSubTab] = useState<SubTabId>("voc")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [emotionFilter, setEmotionFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [selected, setSelected] = useState<Feedback | null>(null)

  const filtered = useMemo(() => {
    let data = [...MOCK_FEEDBACKS]

    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (f) =>
          f.user_intent.toLowerCase().includes(q) ||
          (f.stuck_point?.toLowerCase().includes(q) ?? false) ||
          (f.desired_behavior?.toLowerCase().includes(q) ?? false) ||
          f.bot_answer.toLowerCase().includes(q)
      )
    }

    if (statusFilter === "resolved") data = data.filter((f) => f.resolved)
    if (statusFilter === "unresolved") data = data.filter((f) => !f.resolved)
    if (emotionFilter !== "all") data = data.filter((f) => f.emotion === emotionFilter)

    data.sort((a, b) => {
      const aVal = a[sortKey] ?? ""
      const bVal = b[sortKey] ?? ""
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === "asc" ? cmp : -cmp
    })

    return data
  }, [search, statusFilter, emotionFilter, sortKey, sortDir])

  const stats = useMemo(() => calcStats(MOCK_FEEDBACKS), [])

  const handleSort = (key: string) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key as SortKey)
      setSortDir("desc")
    }
  }

  const handleExportCsv = () => {
    const header = "日時,操作内容,状態,感情,詰まりポイント,要望"
    const rows = filtered.map((f) =>
      [
        new Date(f.created_at).toLocaleString("ja-JP"),
        `"${f.user_intent}"`,
        f.resolved ? "解決" : "未解決",
        f.emotion ?? "",
        `"${f.stuck_point ?? ""}"`,
        `"${f.desired_behavior ?? ""}"`,
      ].join(",")
    )
    const bom = "\uFEFF"
    const blob = new Blob([bom + header + "\n" + rows.join("\n")], {
      type: "text/csv;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `voc_export_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Sub-tab navigation */}
      <div className="flex border-b bg-muted/30 px-4">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${
              subTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {subTab === "churn" ? (
        <ChurnDashboard />
      ) : (
        <div className="mx-auto max-w-6xl space-y-5 p-4 lg:p-6">
          {/* Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              <h1 className="text-lg font-bold">VoC 管理ダッシュボード</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5">
              <Download className="size-3.5" />
              CSVエクスポート
            </Button>
          </div>

          {/* Real-time Alerts */}
          <AlertBanner feedbacks={MOCK_FEEDBACKS} onViewDetail={setSelected} />

          {/* Stats */}
          <StatCards stats={stats} />

          {/* Filters */}
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            emotionFilter={emotionFilter}
            onEmotionChange={setEmotionFilter}
          />

          {/* Table */}
          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              {filtered.length} 件のフィードバック
            </p>
            <FeedbackTable
              feedbacks={filtered}
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
              <DetailPanel feedback={selected} onClose={() => setSelected(null)} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
