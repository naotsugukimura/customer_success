export type ConversationPhase =
  | "greeting"
  | "hearing"
  | "guidance"
  | "resolution"
  | "escalation"
  | "voc_collection"
  | "completed"

export type Emotion = "困った" | "不安" | "諦めた" | "わからない"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: string
  metadata?: {
    phase: ConversationPhase
    buttons?: ButtonOption[]
  }
}

export interface ButtonOption {
  label: string
  value: string
  variant?: "default" | "outline"
}

export interface Feedback {
  id: string
  created_at: string
  session_id: string
  user_intent: string
  bot_answer: string
  resolved: boolean
  stuck_point: string | null
  desired_behavior: string | null
  emotion: Emotion | null
  full_conversation: ChatMessage[]
}

export interface FeedbackFormData {
  stuck_point: string
  desired_behavior: string
  emotion: Emotion
}

export interface FaqItem {
  question: string
  answer: string
  category: string
  keywords: string[]
}

export interface ChatApiRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>
  sessionId: string
}

// ── Churn Risk Detection ──

export type OfficeStatus = "trial" | "active" | "inactive"
export type ChurnRisk = "high" | "medium" | "low"

export type ServiceType =
  | "就労継続支援A型"
  | "就労継続支援B型"
  | "就労移行支援"
  | "放課後等デイサービス"
  | "児童発達支援"
  | "生活介護"
  | "共同生活援助"
  | "居宅介護"
  | "計画相談支援"
  | "短期入所"

export interface Office {
  id: string
  name: string
  serviceType: ServiceType
  prefecture: string
  status: OfficeStatus
  contractStartDate: string
  trialEndDate: string | null
  plan: "trial" | "standard"
  // Engagement signals
  lastLoginDate: string | null
  loginCount30d: number
  totalLoginCount: number
  lastSupportContactDate: string | null
  supportContactCount: number
  featuresUsed: string[]
  billingSubmissionCount: number
  // VoC-derived
  unresolvedIssueCount: number
  negativeEmotionCount: number
  lastFeedbackDate: string | null
  // Risk assessment (computed)
  churnRisk: ChurnRisk
  riskScore: number
  riskFactors: string[]
  recommendedAction: string
}

export interface ChurnStats {
  totalOffices: number
  trialOffices: number
  activeOffices: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  trialConversionRate: number
  averageRiskScore: number
  neverLoggedInCount: number
  noContactCount: number
}
