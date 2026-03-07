import { createClient } from "@supabase/supabase-js"
import type { Feedback } from "./types"

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください")
  }
  return createClient(url, key)
}

export async function insertFeedback(feedback: Feedback): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from("feedbacks").insert({
    id: feedback.id,
    created_at: feedback.created_at,
    session_id: feedback.session_id,
    user_intent: feedback.user_intent,
    bot_answer: feedback.bot_answer,
    resolved: feedback.resolved,
    stuck_point: feedback.stuck_point,
    desired_behavior: feedback.desired_behavior,
    emotion: feedback.emotion,
    full_conversation: feedback.full_conversation,
  })
  if (error) throw new Error(`Supabase insert error: ${error.message}`)
}

export interface FeedbackRow {
  id: string
  created_at: string
  session_id: string
  user_intent: string
  bot_answer: string
  resolved: boolean
  stuck_point: string | null
  desired_behavior: string | null
  emotion: string | null
  full_conversation: string
}

export async function getFeedbacks(from?: string, to?: string): Promise<FeedbackRow[]> {
  const supabase = getSupabase()
  let query = supabase
    .from("feedbacks")
    .select("*")
    .order("created_at", { ascending: false })

  if (from) {
    query = query.gte("created_at", from)
  }
  if (to) {
    query = query.lte("created_at", to + "T23:59:59")
  }

  const { data, error } = await query
  if (error) throw new Error(`Supabase query error: ${error.message}`)
  return (data ?? []) as FeedbackRow[]
}
