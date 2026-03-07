import { NextRequest } from "next/server"
import { getFeedbacks } from "@/lib/db"

export async function GET(req: NextRequest) {
  const token =
    req.headers.get("authorization")?.replace("Bearer ", "") ??
    new URL(req.url).searchParams.get("token")

  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken || adminToken === "your-admin-token-here") {
    return Response.json(
      { error: "管理者トークンが設定されていません" },
      { status: 500 }
    )
  }

  if (token !== adminToken) {
    return Response.json({ error: "認証に失敗しました" }, { status: 401 })
  }

  try {
    const feedbacks = await getFeedbacks()
    return Response.json({ feedbacks, total: feedbacks.length })
  } catch (error) {
    console.error("Feedback list error:", error)
    return Response.json(
      { error: "データ取得に失敗しました" },
      { status: 500 }
    )
  }
}
