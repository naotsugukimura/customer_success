"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, X, Clock, AlertTriangle } from "lucide-react"
import type { Feedback } from "@/lib/types"

interface AlertBannerProps {
  feedbacks: Feedback[]
  onViewDetail: (fb: Feedback) => void
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "たった今"
  if (mins < 60) return `${mins}分前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}

export function AlertBanner({ feedbacks, onViewDetail }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [pulse, setPulse] = useState(true)

  // 未解決かつ直近24時間のフィードバック
  const recentUnresolved = feedbacks.filter((fb) => {
    if (fb.resolved) return false
    if (dismissed.has(fb.id)) return false
    const age = Date.now() - new Date(fb.created_at).getTime()
    return age < 24 * 60 * 60 * 1000
  })

  useEffect(() => {
    if (recentUnresolved.length === 0) return
    const timer = setInterval(() => setPulse((p) => !p), 2000)
    return () => clearInterval(timer)
  }, [recentUnresolved.length])

  if (recentUnresolved.length === 0) return null

  return (
    <div className="space-y-2">
      {recentUnresolved.slice(0, 3).map((fb) => (
        <div
          key={fb.id}
          className={`flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 transition-all ${
            pulse ? "shadow-sm" : "shadow-md shadow-red-100"
          }`}
        >
          <div className="mt-0.5">
            <AlertTriangle className="size-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Bell className="size-3 text-red-400" />
              <span className="text-xs font-medium text-red-700">
                未解決フィードバック
              </span>
              <span className="flex items-center gap-1 text-xs text-red-400">
                <Clock className="size-3" />
                {timeAgo(fb.created_at)}
              </span>
            </div>
            <p className="mt-1 truncate text-sm font-medium text-red-900">
              「{fb.user_intent}」→ {fb.stuck_point ?? "詳細未記入"}
            </p>
            {fb.emotion && (
              <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                {fb.emotion}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 border-red-200 text-xs text-red-700 hover:bg-red-100"
              onClick={() => onViewDetail(fb)}
            >
              詳細を見る
            </Button>
            <button
              className="rounded p-1 text-red-300 hover:bg-red-100 hover:text-red-500"
              onClick={() => setDismissed((prev) => new Set(prev).add(fb.id))}
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
      {recentUnresolved.length > 3 && (
        <p className="text-center text-xs text-red-400">
          他 {recentUnresolved.length - 3} 件の未対応アラート
        </p>
      )}
    </div>
  )
}
