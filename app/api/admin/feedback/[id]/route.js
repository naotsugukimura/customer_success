import { verifyAdmin } from '@/lib/auth';
import { getFeedbackById } from '@/lib/store';

export async function GET(request, { params }) {
  if (!verifyAdmin(request)) {
    return Response.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const feedback = getFeedbackById(id);
    if (!feedback) {
      return Response.json({ error: '見つかりません' }, { status: 404 });
    }
    return Response.json(feedback);
  } catch (err) {
    console.error('Detail error:', err);
    return Response.json({ error: 'データ取得に失敗しました' }, { status: 500 });
  }
}
