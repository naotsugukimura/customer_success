"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RiskBadge } from "./RiskBadge"
import { RiskScoreBar } from "./RiskScoreBar"
import type { Office } from "@/lib/types"
import {
  X,
  Building2,
  LogIn,
  MessageSquare,
  FileText,
  Layers,
  AlertTriangle,
  Lightbulb,
  Calendar,
} from "lucide-react"

interface OfficeDetailPanelProps {
  office: Office
  onClose: () => void
}

function Section({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="size-3.5 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <div>{children}</div>
    </div>
  )
}

function MetricRow({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={warning ? "font-medium text-red-600" : "font-medium"}>{value}</span>
    </div>
  )
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

const STATUS_LABELS: Record<string, string> = {
  trial: "体験中",
  active: "契約中",
  inactive: "休止中",
}

export function OfficeDetailPanel({ office, onClose }: OfficeDetailPanelProps) {
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-background shadow-xl animate-in slide-in-from-right-full duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-primary" />
          <h3 className="text-sm font-bold">事業所詳細</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="size-8">
          <X className="size-4" />
        </Button>
      </div>

      <div className="h-[calc(100%-52px)] overflow-y-auto">
        <div className="space-y-5 p-4">
          {/* Office Name & Status */}
          <div>
            <h2 className="text-lg font-bold">{office.name}</h2>
            <p className="text-xs text-muted-foreground">
              {office.prefecture} ・ {office.serviceType}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline">{STATUS_LABELS[office.status]}</Badge>
              <RiskBadge risk={office.churnRisk} />
              <RiskScoreBar score={office.riskScore} />
            </div>
          </div>

          {/* Contract Dates */}
          <Section icon={Calendar} label="契約情報">
            <div className="rounded-md border p-3 space-y-0.5">
              <MetricRow label="契約開始日" value={formatDate(office.contractStartDate)} />
              {office.trialEndDate && (
                <MetricRow
                  label="体験終了日"
                  value={formatDate(office.trialEndDate)}
                  warning={
                    new Date(office.trialEndDate).getTime() - new Date("2026-03-08").getTime() <
                    14 * 24 * 60 * 60 * 1000
                  }
                />
              )}
              <MetricRow
                label="プラン"
                value={office.plan === "trial" ? "無料体験" : "スタンダード"}
              />
            </div>
          </Section>

          {/* Engagement Metrics */}
          <Section icon={LogIn} label="エンゲージメント指標">
            <div className="rounded-md border p-3 space-y-0.5">
              <MetricRow
                label="最終ログイン"
                value={office.lastLoginDate ? formatDate(office.lastLoginDate) : "未ログイン"}
                warning={!office.lastLoginDate}
              />
              <MetricRow
                label="直近30日ログイン数"
                value={`${office.loginCount30d}回`}
                warning={office.loginCount30d === 0}
              />
              <MetricRow label="累計ログイン数" value={`${office.totalLoginCount}回`} />
            </div>
          </Section>

          {/* Support Contact */}
          <Section icon={MessageSquare} label="サポート利用状況">
            <div className="rounded-md border p-3 space-y-0.5">
              <MetricRow
                label="問い合わせ数"
                value={`${office.supportContactCount}件`}
                warning={office.supportContactCount === 0 && office.status === "trial"}
              />
              <MetricRow
                label="最終問い合わせ"
                value={formatDate(office.lastSupportContactDate)}
              />
              <MetricRow
                label="未解決件数"
                value={`${office.unresolvedIssueCount}件`}
                warning={office.unresolvedIssueCount >= 2}
              />
              <MetricRow
                label="ネガティブ感情"
                value={`${office.negativeEmotionCount}回`}
                warning={office.negativeEmotionCount >= 2}
              />
            </div>
          </Section>

          {/* Feature Usage */}
          <Section icon={Layers} label="機能利用状況">
            <div className="rounded-md border p-3">
              <MetricRow
                label="請求データ作成"
                value={`${office.billingSubmissionCount}回`}
                warning={office.billingSubmissionCount === 0}
              />
              <div className="mt-2 border-t pt-2">
                <p className="mb-1.5 text-xs text-muted-foreground">使用中の機能</p>
                {office.featuresUsed.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {office.featuresUsed.map((f) => (
                      <Badge key={f} variant="secondary" className="text-[10px]">
                        {f}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-red-600">機能の利用実績がありません</p>
                )}
              </div>
            </div>
          </Section>

          {/* Billing Usage */}
          <Section icon={FileText} label="請求実績">
            <div className="rounded-md border p-3">
              <MetricRow
                label="請求データ作成回数"
                value={`${office.billingSubmissionCount}回`}
                warning={office.billingSubmissionCount === 0}
              />
            </div>
          </Section>

          {/* Risk Factors */}
          {office.riskFactors.length > 0 && (
            <Section icon={AlertTriangle} label="リスク要因">
              <div className="space-y-1.5">
                {office.riskFactors.map((factor, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2"
                  >
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-red-500" />
                    <p className="text-xs text-red-700">{factor}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Recommended Action */}
          <Section icon={Lightbulb} label="推奨アクション">
            <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-sm font-medium text-blue-800">
                {office.recommendedAction}
              </p>
            </div>
          </Section>

          {/* Action Buttons (mock) */}
          <div className="flex gap-2 border-t pt-4">
            <Button size="sm" className="flex-1">
              対応済みにする
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              メモを追加
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
