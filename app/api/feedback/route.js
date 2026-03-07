import { createFeedback } from '@/lib/store';

export async function POST(request) {
  try {
    const data = await request.json();
    const result = createFeedback(data);
    return Response.json({ success: true, id: result.id });
  } catch (err) {
    console.error('Feedback save error:', err);
    return Response.json(
      { error: 'フィードバックの保存に失敗しました' },
      { status: 500 }
    );
  }
}
