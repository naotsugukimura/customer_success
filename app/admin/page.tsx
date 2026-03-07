"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { FeedbackRow } from "@/lib/db"
import type { Emotion } from "@/lib/types"
import { Download, Search, X } from "lucide-react"

type FilterStatus = "all" | "resolved" | "unresolved"

export default function AdminPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackRow[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [emotionFilter, setEmotionFilter] = useState<string>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const token =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("token") ?? ""
      : ""

  useEffect(() => {
    if (!token) {
      setError("URLに ?token=YOUR_TOKEN を付けてアクセスしてください")
      setLoading(false)
      return
    }
    fetch("/api/admin/feedback", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setFeedbacks(data.feedbacks ?? [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  const filtered = feedbacks.filter((fb) => {
    if (statusFilter === "resolved" && !fb.resolved) return false
    if (statusFilter === "unresolved" && fb.resolved) return false
    if (emotionFilter !== "all" && fb.emotion !== emotionFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (fb.user_intent ?? "").toLowerCase().includes(q) ||
        (fb.stuck_point ?? "").toLowerCase().includes(q) ||
        (fb.desired_behavior ?? "").toLowerCase().includes(q) ||
        (fb.bot_answer ?? "").toLowerCase().includes(q)
      )
    }
    return true
  })

  const total = feedbacks.length
  const resolved = feedbacks.filter((fb) => fb.resolved).length
  const unresolved = total - resolved
  const emotionCounts: Record<string, number> = {}
  feedbacks.forEach((fb) => {
    if (fb.emotion) emotionCounts[fb.emotion] = (emotionCounts[fb.emotion] || 0) + 1
  })

  const selected = selectedId ? feedbacks.find((fb) => fb.id === selectedId) : null

  const handleExport = () => {
    window.open(`/api/admin/export?token=${encodeURIComponent(token)}`, "_blank")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        読み込み中...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center max-w-md">
          <p className="text-destructive font-medium">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          VoC管理ダッシュボード
        </h1>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          CSV出力
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="総問い合わせ" value={total} color="bg-primary" />
        <StatCard label="未解決" value={unresolved} color="bg-destructive" />
        <StatCard label="解決済み" value={resolved} color="bg-emerald-500" />
        {(["困った", "不安", "諦めた", "わからない"] as Emotion[]).map((em) => (
          <StatCard
            key={em}
            label={em}
            value={emotionCounts[em] || 0}
            color="bg-amber-500"
          />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="フリーワード検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
        >
          <option value="all">全ステータス</option>
          <option value="resolved">解決済み</option>
          <option value="unresolved">未解決</option>
        </select>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background"
          value={emotionFilter}
          onChange={(e) => setEmotionFilter(e.target.value)}
        >
          <option value="all">全感情</option>
          <option value="困った">困った</option>
          <option value="不安">不安</option>
          <option value="諦めた">諦めた</option>
          <option value="わからない">わからない</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          データがありません
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {["日時", "操作内容", "状態", "感情", "詰まりポイント"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((fb) => (
                <tr
                  key={fb.id}
                  onClick={() => setSelectedId(fb.id)}
                  className={`border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedId === fb.id ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(fb.created_at).toLocaleString("ja-JP")}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate">
                    {fb.user_intent}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        fb.resolved
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {fb.resolved ? "解決" : "未解決"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{fb.emotion ?? "-"}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate">
                    {fb.stuck_point ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Detail Slide-over */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex justify-end"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="w-full max-w-lg bg-background h-full overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-background border-b px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">フィードバック詳細</h2>
              <button
                onClick={() => setSelectedId(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="日時" value={new Date(selected.created_at).toLocaleString("ja-JP")} />
              <Field label="セッションID" value={selected.session_id} />
              <Field label="やりたかった操作" value={selected.user_intent} />
              <Field label="ボットの回答" value={selected.bot_answer} />
              <Field label="状態" value={selected.resolved ? "解決済み" : "未解決"} />
              <Field label="詰まりポイント" value={selected.stuck_point} />
              <Field label="こうなってほしかった" value={selected.desired_behavior} />
              <Field label="感情" value={selected.emotion} />

              {selected.full_conversation && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-2">
                    会話ログ
                  </div>
                  <div className="border rounded-lg p-3 space-y-2 max-h-72 overflow-y-auto">
                    {(typeof selected.full_conversation === "string"
                      ? JSON.parse(selected.full_conversation)
                      : selected.full_conversation
                    ).map(
                      (msg: { role: string; content: string }, i: number) => (
                        <div key={i} className="flex gap-2 items-start">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded shrink-0 ${
                              msg.role === "user"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {msg.role === "user" ? "ユーザー" : "ボット"}
                          </span>
                          <span className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <Card className="relative overflow-hidden p-4">
      <div className={`absolute top-0 left-0 right-0 h-1 ${color}`} />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </Card>
  )
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-1">
        {label}
      </div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {value || "-"}
      </div>
    </div>
  )
}
