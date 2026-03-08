import type { Office, ChurnRisk, ChurnStats, ServiceType } from "./types"

// ── Feature list (あゆみ請求の機能) ──
const ALL_FEATURES = [
  "実績入力",
  "請求データ作成",
  "帳票出力",
  "利用者管理",
  "事業所情報",
  "上限額管理",
  "エラーチェック",
]

// ── Risk scoring ──
function daysAgo(isoDate: string | null): number {
  if (!isoDate) return 9999
  const now = new Date("2026-03-08")
  const d = new Date(isoDate)
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

function daysUntil(isoDate: string | null): number {
  if (!isoDate) return 9999
  const now = new Date("2026-03-08")
  const d = new Date(isoDate)
  return Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function calcRiskScore(
  o: Omit<Office, "churnRisk" | "riskScore" | "riskFactors" | "recommendedAction">
): { score: number; risk: ChurnRisk; factors: string[]; action: string } {
  let score = 0
  const factors: string[] = []

  // Trial + never logged in
  if (o.status === "trial" && o.totalLoginCount === 0) {
    score += 40
    factors.push("無料体験開始後、一度もログインしていません")
  }

  // Trial + few logins + 30 days in
  if (o.status === "trial" && o.totalLoginCount > 0 && o.totalLoginCount < 3) {
    const daysSinceStart = daysAgo(o.contractStartDate)
    if (daysSinceStart > 30) {
      score += 25
      factors.push("体験開始から30日以上経過していますがログインが少ないです")
    }
  }

  // Never submitted billing
  if (o.billingSubmissionCount === 0) {
    score += 20
    factors.push("請求データの作成実績がありません")
  }

  // No login in 30+ days (active users)
  if (o.status === "active" && daysAgo(o.lastLoginDate) > 30) {
    score += 25
    factors.push("直近30日間ログインがありません")
  } else if (o.status === "active" && daysAgo(o.lastLoginDate) > 14) {
    score += 15
    factors.push("直近14日間ログインがありません")
  }

  // No support contact ever
  if (o.supportContactCount === 0 && o.status === "trial") {
    score += 10
    factors.push("サポートへの問い合わせがありません")
  }

  // Unresolved issues
  if (o.unresolvedIssueCount >= 2) {
    score += 15
    factors.push(`未解決の問い合わせが${o.unresolvedIssueCount}件あります`)
  }

  // Negative emotions
  if (o.negativeEmotionCount >= 2) {
    score += 10
    factors.push("ネガティブな感情のフィードバックが複数回あります")
  }

  // Low feature usage
  if (o.featuresUsed.length <= 2) {
    score += 10
    factors.push(`使用機能が${o.featuresUsed.length}個と少ないです`)
  }

  // Trial ending soon
  if (o.status === "trial" && o.trialEndDate) {
    const remaining = daysUntil(o.trialEndDate)
    if (remaining < 14 && remaining >= 0) {
      score += 15
      factors.push(`無料体験期間が残り${remaining}日です`)
    }
  }

  score = Math.min(score, 100)

  const risk: ChurnRisk = score >= 60 ? "high" : score >= 30 ? "medium" : "low"

  let action = ""
  if (score >= 80) {
    action = "至急：電話で操作サポートを提案してください"
  } else if (score >= 60) {
    action = "初期設定のオンボーディング面談を設定してください"
  } else if (score >= 30) {
    action = "利用状況の確認メールを送信してください"
  } else {
    action = "定期フォローで問題ないか確認してください"
  }

  return { score, risk, factors, action }
}

// ── Static mock data (24 offices, deterministic) ──

type RawOffice = Omit<Office, "churnRisk" | "riskScore" | "riskFactors" | "recommendedAction">

const RAW_OFFICES: RawOffice[] = [
  // === Trial: 6 offices ===
  // 2 never logged in (high risk)
  {
    id: "off-001",
    name: "あさひ福祉事業所",
    serviceType: "就労継続支援B型" as ServiceType,
    prefecture: "埼玉県",
    status: "trial",
    contractStartDate: "2026-01-20",
    trialEndDate: "2026-03-21",
    plan: "trial",
    lastLoginDate: null,
    loginCount30d: 0,
    totalLoginCount: 0,
    lastSupportContactDate: null,
    supportContactCount: 0,
    featuresUsed: [],
    billingSubmissionCount: 0,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: null,
  },
  {
    id: "off-002",
    name: "こすもす作業所",
    serviceType: "生活介護" as ServiceType,
    prefecture: "千葉県",
    status: "trial",
    contractStartDate: "2026-02-10",
    trialEndDate: "2026-04-11",
    plan: "trial",
    lastLoginDate: null,
    loginCount30d: 0,
    totalLoginCount: 0,
    lastSupportContactDate: null,
    supportContactCount: 0,
    featuresUsed: [],
    billingSubmissionCount: 0,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: null,
  },
  // 2 low usage trial (medium risk)
  {
    id: "off-003",
    name: "すみれケアホーム",
    serviceType: "共同生活援助" as ServiceType,
    prefecture: "神奈川県",
    status: "trial",
    contractStartDate: "2026-01-15",
    trialEndDate: "2026-03-16",
    plan: "trial",
    lastLoginDate: "2026-02-05",
    loginCount30d: 0,
    totalLoginCount: 2,
    lastSupportContactDate: null,
    supportContactCount: 0,
    featuresUsed: ["利用者管理"],
    billingSubmissionCount: 0,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: null,
  },
  {
    id: "off-004",
    name: "はるか就労支援センター",
    serviceType: "就労移行支援" as ServiceType,
    prefecture: "大阪府",
    status: "trial",
    contractStartDate: "2026-02-01",
    trialEndDate: "2026-04-02",
    plan: "trial",
    lastLoginDate: "2026-02-20",
    loginCount30d: 1,
    totalLoginCount: 2,
    lastSupportContactDate: "2026-02-20",
    supportContactCount: 1,
    featuresUsed: ["実績入力", "利用者管理"],
    billingSubmissionCount: 0,
    unresolvedIssueCount: 1,
    negativeEmotionCount: 1,
    lastFeedbackDate: "2026-02-20",
  },
  // 2 active trial (low risk)
  {
    id: "off-005",
    name: "あかり児童デイ",
    serviceType: "放課後等デイサービス" as ServiceType,
    prefecture: "東京都",
    status: "trial",
    contractStartDate: "2026-02-15",
    trialEndDate: "2026-04-16",
    plan: "trial",
    lastLoginDate: "2026-03-07",
    loginCount30d: 12,
    totalLoginCount: 18,
    lastSupportContactDate: "2026-03-05",
    supportContactCount: 3,
    featuresUsed: ["実績入力", "請求データ作成", "帳票出力", "利用者管理"],
    billingSubmissionCount: 1,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: "2026-03-05",
  },
  {
    id: "off-006",
    name: "のぞみ発達支援室",
    serviceType: "児童発達支援" as ServiceType,
    prefecture: "愛知県",
    status: "trial",
    contractStartDate: "2026-02-20",
    trialEndDate: "2026-04-21",
    plan: "trial",
    lastLoginDate: "2026-03-06",
    loginCount30d: 8,
    totalLoginCount: 10,
    lastSupportContactDate: "2026-03-01",
    supportContactCount: 2,
    featuresUsed: ["実績入力", "利用者管理", "事業所情報"],
    billingSubmissionCount: 0,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: "2026-03-01",
  },

  // === Active: 15 offices ===
  // 3 declining (medium-high risk)
  {
    id: "off-007",
    name: "ひまわり支援センター",
    serviceType: "就労継続支援A型" as ServiceType,
    prefecture: "東京都",
    status: "active",
    contractStartDate: "2025-06-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-01-25",
    loginCount30d: 0,
    totalLoginCount: 45,
    lastSupportContactDate: "2026-01-20",
    supportContactCount: 5,
    featuresUsed: ["実績入力", "請求データ作成", "帳票出力"],
    billingSubmissionCount: 7,
    unresolvedIssueCount: 3,
    negativeEmotionCount: 2,
    lastFeedbackDate: "2026-01-20",
  },
  {
    id: "off-008",
    name: "さくら福祉事業所",
    serviceType: "生活介護" as ServiceType,
    prefecture: "大阪府",
    status: "active",
    contractStartDate: "2025-08-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-02-01",
    loginCount30d: 0,
    totalLoginCount: 30,
    lastSupportContactDate: "2026-02-01",
    supportContactCount: 3,
    featuresUsed: ["実績入力", "請求データ作成", "帳票出力", "利用者管理"],
    billingSubmissionCount: 5,
    unresolvedIssueCount: 2,
    negativeEmotionCount: 3,
    lastFeedbackDate: "2026-02-01",
  },
  {
    id: "off-009",
    name: "あおぞらケアセンター",
    serviceType: "短期入所" as ServiceType,
    prefecture: "福岡県",
    status: "active",
    contractStartDate: "2025-09-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-02-10",
    loginCount30d: 1,
    totalLoginCount: 25,
    lastSupportContactDate: "2026-01-15",
    supportContactCount: 4,
    featuresUsed: ["実績入力", "請求データ作成"],
    billingSubmissionCount: 4,
    unresolvedIssueCount: 1,
    negativeEmotionCount: 1,
    lastFeedbackDate: "2026-01-15",
  },

  // 10 healthy active offices
  {
    id: "off-010",
    name: "たんぽぽ作業所",
    serviceType: "就労継続支援B型" as ServiceType,
    prefecture: "北海道",
    status: "active",
    contractStartDate: "2025-04-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-03-07",
    loginCount30d: 18,
    totalLoginCount: 120,
    lastSupportContactDate: "2026-02-15",
    supportContactCount: 8,
    featuresUsed: ["実績入力", "請求データ作成", "帳票出力", "利用者管理", "上限額管理"],
    billingSubmissionCount: 11,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: "2026-02-15",
  },
  {
    id: "off-011",
    name: "にじいろ生活支援センター",
    serviceType: "生活介護" as ServiceType,
    prefecture: "東京都",
    status: "active",
    contractStartDate: "2025-05-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-03-08",
    loginCount30d: 22,
    totalLoginCount: 150,
    lastSupportContactDate: "2026-03-02",
    supportContactCount: 12,
    featuresUsed: ["実績入力", "請求データ作成", "帳票出力", "利用者管理", "事業所情報", "エラーチェック"],
    billingSubmissionCount: 10,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: "2026-03-02",
  },
  {
    id: "off-012",
    name: "つばさ就労支援B型",
    serviceType: "就労継続支援B型" as ServiceType,
    prefecture: "愛知県",
    status: "active",
    contractStartDate: "2025-07-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-03-06",
    loginCount30d: 15,
    totalLoginCount: 80,
    lastSupportContactDate: "2026-02-20",
    supportContactCount: 6,
    featuresUsed: ["実績入力", "請求データ作成", "帳票出力", "利用者管理"],
    billingSubmissionCount: 8,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: "2026-02-20",
  },
  {
    id: "off-013",
    name: "みどり園",
    serviceType: "児童発達支援" as ServiceType,
    prefecture: "神奈川県",
    status: "active",
    contractStartDate: "2025-03-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-03-07",
    loginCount30d: 20,
    totalLoginCount: 200,
    lastSupportContactDate: "2026-02-28",
    supportContactCount: 10,
    featuresUsed: ["実績入力", "請求データ作成", "帳票出力", "利用者管理", "上限額管理", "エラーチェック"],
    billingSubmissionCount: 12,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: "2026-02-28",
  },
  {
    id: "off-014",
    name: "やまびこ相談支援事業所",
    serviceType: "計画相談支援" as ServiceType,
    prefecture: "広島県",
    status: "active",
    contractStartDate: "2025-06-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-03-05",
    loginCount30d: 10,
    totalLoginCount: 60,
    lastSupportContactDate: "2026-01-30",
    supportContactCount: 4,
    featuresUsed: ["実績入力", "請求データ作成", "帳票出力"],
    billingSubmissionCount: 9,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: "2026-01-30",
  },
  {
    id: "off-015",
    name: "ふたば放課後デイ",
    serviceType: "放課後等デイサービス" as ServiceType,
    prefecture: "京都府",
    status: "active",
    contractStartDate: "2025-10-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-03-07",
    loginCount30d: 16,
    totalLoginCount: 50,
    lastSupportContactDate: "2026-02-25",
    supportContactCount: 5,
    featuresUsed: ["実績入力", "請求データ作成", "帳票出力", "利用者管理"],
    billingSubmissionCount: 5,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: "2026-02-25",
  },
  {
    id: "off-016",
    name: "かえで居宅介護事業所",
    serviceType: "居宅介護" as ServiceType,
    prefecture: "兵庫県",
    status: "active",
    contractStartDate: "2025-11-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-03-04",
    loginCount30d: 8,
    totalLoginCount: 30,
    lastSupportContactDate: "2026-02-10",
    supportContactCount: 3,
    featuresUsed: ["実績入力", "請求データ作成", "帳票出力"],
    billingSubmissionCount: 4,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: "2026-02-10",
  },
  {
    id: "off-017",
    name: "そよかぜ生活介護",
    serviceType: "生活介護" as ServiceType,
    prefecture: "宮城県",
    status: "active",
    contractStartDate: "2025-08-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-03-06",
    loginCount30d: 14,
    totalLoginCount: 70,
    lastSupportContactDate: "2026-03-01",
    supportContactCount: 7,
    featuresUsed: ["実績入力", "請求データ作成", "帳票出力", "利用者管理", "事業所情報"],
    billingSubmissionCount: 7,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: "2026-03-01",
  },
  {
    id: "off-018",
    name: "ゆめの木就労A型",
    serviceType: "就労継続支援A型" as ServiceType,
    prefecture: "福岡県",
    status: "active",
    contractStartDate: "2025-12-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-03-07",
    loginCount30d: 12,
    totalLoginCount: 25,
    lastSupportContactDate: "2026-02-18",
    supportContactCount: 4,
    featuresUsed: ["実績入力", "請求データ作成", "帳票出力", "利用者管理"],
    billingSubmissionCount: 3,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: "2026-02-18",
  },

  // 2 power users
  {
    id: "off-019",
    name: "わかば総合福祉センター",
    serviceType: "就労移行支援" as ServiceType,
    prefecture: "東京都",
    status: "active",
    contractStartDate: "2024-10-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-03-08",
    loginCount30d: 28,
    totalLoginCount: 350,
    lastSupportContactDate: "2026-03-06",
    supportContactCount: 20,
    featuresUsed: ALL_FEATURES,
    billingSubmissionCount: 17,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: "2026-03-06",
  },
  {
    id: "off-020",
    name: "きらり放課後クラブ",
    serviceType: "放課後等デイサービス" as ServiceType,
    prefecture: "大阪府",
    status: "active",
    contractStartDate: "2024-12-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-03-08",
    loginCount30d: 25,
    totalLoginCount: 280,
    lastSupportContactDate: "2026-03-04",
    supportContactCount: 15,
    featuresUsed: ALL_FEATURES,
    billingSubmissionCount: 15,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: "2026-03-04",
  },
  {
    id: "off-021",
    name: "まなび就労移行",
    serviceType: "就労移行支援" as ServiceType,
    prefecture: "北海道",
    status: "active",
    contractStartDate: "2025-09-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-03-03",
    loginCount30d: 6,
    totalLoginCount: 40,
    lastSupportContactDate: "2026-02-10",
    supportContactCount: 3,
    featuresUsed: ["実績入力", "請求データ作成", "帳票出力"],
    billingSubmissionCount: 6,
    unresolvedIssueCount: 1,
    negativeEmotionCount: 0,
    lastFeedbackDate: "2026-02-10",
  },

  // === Inactive: 3 offices ===
  {
    id: "off-022",
    name: "いろは福祉作業所",
    serviceType: "就労継続支援B型" as ServiceType,
    prefecture: "静岡県",
    status: "inactive",
    contractStartDate: "2025-04-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2025-12-15",
    loginCount30d: 0,
    totalLoginCount: 35,
    lastSupportContactDate: "2025-12-10",
    supportContactCount: 2,
    featuresUsed: ["実績入力", "請求データ作成"],
    billingSubmissionCount: 6,
    unresolvedIssueCount: 2,
    negativeEmotionCount: 2,
    lastFeedbackDate: "2025-12-10",
  },
  {
    id: "off-023",
    name: "ほほえみケア",
    serviceType: "居宅介護" as ServiceType,
    prefecture: "長野県",
    status: "inactive",
    contractStartDate: "2025-05-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2025-11-20",
    loginCount30d: 0,
    totalLoginCount: 20,
    lastSupportContactDate: "2025-11-18",
    supportContactCount: 1,
    featuresUsed: ["実績入力"],
    billingSubmissionCount: 3,
    unresolvedIssueCount: 1,
    negativeEmotionCount: 1,
    lastFeedbackDate: "2025-11-18",
  },
  {
    id: "off-024",
    name: "あゆみ生活支援",
    serviceType: "共同生活援助" as ServiceType,
    prefecture: "岡山県",
    status: "inactive",
    contractStartDate: "2025-07-01",
    trialEndDate: null,
    plan: "standard",
    lastLoginDate: "2026-01-05",
    loginCount30d: 0,
    totalLoginCount: 28,
    lastSupportContactDate: "2025-12-20",
    supportContactCount: 3,
    featuresUsed: ["実績入力", "請求データ作成", "帳票出力"],
    billingSubmissionCount: 5,
    unresolvedIssueCount: 0,
    negativeEmotionCount: 0,
    lastFeedbackDate: "2025-12-20",
  },
]

// Apply risk scoring to each office
export const MOCK_OFFICES: Office[] = RAW_OFFICES.map((raw) => {
  const { score, risk, factors, action } = calcRiskScore(raw)
  return {
    ...raw,
    churnRisk: risk,
    riskScore: score,
    riskFactors: factors,
    recommendedAction: action,
  }
})

// ── Stats ──
export function calcChurnStats(offices: Office[]): ChurnStats {
  const trialOffices = offices.filter((o) => o.status === "trial")
  const activeOffices = offices.filter((o) => o.status === "active")
  const highRisk = offices.filter((o) => o.churnRisk === "high")
  const mediumRisk = offices.filter((o) => o.churnRisk === "medium")
  const lowRisk = offices.filter((o) => o.churnRisk === "low")
  const neverLoggedIn = offices.filter(
    (o) => o.status === "trial" && o.totalLoginCount === 0
  )
  const noContact = offices.filter((o) => o.supportContactCount === 0)
  const totalScore = offices.reduce((s, o) => s + o.riskScore, 0)

  // Mock trial conversion: active / (active + inactive) as proxy
  const converted = activeOffices.length
  const totalEverTried = converted + offices.filter((o) => o.status === "inactive").length
  const conversionRate = totalEverTried > 0 ? Math.round((converted / totalEverTried) * 100) : 0

  return {
    totalOffices: offices.length,
    trialOffices: trialOffices.length,
    activeOffices: activeOffices.length,
    highRiskCount: highRisk.length,
    mediumRiskCount: mediumRisk.length,
    lowRiskCount: lowRisk.length,
    trialConversionRate: conversionRate,
    averageRiskScore: offices.length > 0 ? Math.round(totalScore / offices.length) : 0,
    neverLoggedInCount: neverLoggedIn.length,
    noContactCount: noContact.length,
  }
}
