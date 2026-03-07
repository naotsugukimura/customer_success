import { verifyAdmin } from '@/lib/auth';
import { listFeedbacks, feedbacksToCsv } from '@/lib/store';

export async function GET(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const feedbacks = listFeedbacks();
    const csv = feedbacksToCsv(feedbacks);
    const date = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="voc-export-${date}.csv"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return Response.json({ error: 'エクスポートに失敗しました' }, { status: 500 });
  }
}
