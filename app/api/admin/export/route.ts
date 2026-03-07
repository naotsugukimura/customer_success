import { NextRequest } from "next/server"
import { getFeedbacks } from "@/lib/db"

function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token") || req.headers.get("authorization")?.replace("Bearer ", "")
  const from = searchParams.get("from") ?? undefined
  const to = searchParams.get("to") ?? undefined

  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken || adminToken === "your-admin-token-here") {
    return new Response(
      JSON.stringify({ error: "管理者トークンが設定されていません" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  if (token !== adminToken) {
    return new Response(
      JSON.stringify({ error: "認証に失敗しました" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  try {
    const feedbacks = getFeedbacks(from, to)

    const headers = [
      "id",
      "created_at",
      "session_id",
      "user_intent",
      "bot_answer",
      "resolved",
      "stuck_point",
      "desired_behavior",
      "emotion",
      "full_conversation",
    ]

    const csvRows = [
      headers.join(","),
      ...feedbacks.map((row) =>
        [
          escapeCsvField(row.id),
          escapeCsvField(row.created_at),
          escapeCsvField(row.session_id),
          escapeCsvField(row.user_intent),
          escapeCsvField(row.bot_answer),
          row.resolved ? "はい" : "いいえ",
          escapeCsvField(row.stuck_point ?? ""),
          escapeCsvField(row.desired_behavior ?? ""),
          escapeCsvField(row.emotion ?? ""),
          escapeCsvField(row.full_conversation),
        ].join(",")
      ),
    ]

    const bom = "\uFEFF"
    const csvContent = bom + csvRows.join("\n")

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="voc-feedback-${from ?? "all"}-${to ?? "all"}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return new Response(
      JSON.stringify({ error: "エクスポートに失敗しました" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
