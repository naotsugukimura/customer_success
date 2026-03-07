import { NextRequest } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { buildSystemPrompt } from "@/lib/system-prompt"
import type { ChatApiRequest } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const body: ChatApiRequest = await req.json()
    const { messages, sessionId } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "メッセージが空です" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "セッションIDが必要です" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY 環境変数が設定されていません。.env.local を確認してください。" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    const client = new Anthropic({ apiKey })

    const formattedMessages = messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }))

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = client.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: buildSystemPrompt(),
            messages: formattedMessages,
          })

          for await (const event of response) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const data = JSON.stringify({ text: event.delta.text })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "AI処理でエラーが発生しました"
          const data = JSON.stringify({ error: message })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    const message =
      error instanceof Error ? error.message : "リクエスト処理でエラーが発生しました"
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
