import { NextRequest, NextResponse } from "next/server"
import { insertFeedback } from "@/lib/db"
import type { Feedback } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const feedback: Feedback = await req.json()

    if (!feedback.id || !feedback.session_id || !feedback.user_intent) {
      return NextResponse.json(
        { error: "必須フィールドが不足しています" },
        { status: 400 }
      )
    }

    await insertFeedback(feedback)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feedback save error:", error)
    const message =
      error instanceof Error ? error.message : "フィードバックの保存に失敗しました"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
