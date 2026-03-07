import { streamChat } from '@/lib/claude';

export async function POST(request) {
  const { session_id, message, history = [] } = await request.json();

  if (!session_id || !message) {
    return Response.json(
      { error: 'session_id and message are required' },
      { status: 400 }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let fullText = '';
        for await (const delta of streamChat(message, history)) {
          fullText += delta;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`)
          );
        }
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, full_text: fullText })}\n\n`
          )
        );
      } catch (err) {
        console.error('Chat error:', err);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: 'AIの応答中にエラーが発生しました' })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
