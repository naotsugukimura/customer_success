export type ConversationPhase =
  | "greeting"
  | "hearing"
  | "guidance"
  | "resolution"
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
