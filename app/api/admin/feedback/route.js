import { verifyAdmin } from '@/lib/auth';
import { listFeedbacks } from '@/lib/store';

export async function GET(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const feedbacks = listFeedbacks();
    return Response.json({ feedbacks, total: feedbacks.length });
  } catch (err) {
    console.error('List error:', err);
    return Response.json({ error: 'データ取得に失敗しました' }, { status: 500 });
  }
}
