import type { Feedback, Emotion } from "./types"

const FACILITY_NAMES = [
  "ひまわり支援センター",
  "さくら福祉事業所",
  "あおぞらケアセンター",
  "たんぽぽ作業所",
  "にじいろ生活支援センター",
  "つばさ就労支援B型",
  "みどり園",
  "やまびこ相談支援事業所",
]

const USER_INTENTS = [
  "利用者の記録を入力したい",
  "請求書を出力したい",
  "利用者情報を変更したい",
  "月次報告書を作成したい",
  "新しい利用者を登録したい",
  "サービス提供実績を修正したい",
  "国保連への提出データを作りたい",
  "職員のシフトを変更したい",
  "受給者証の更新をしたい",
  "個別支援計画を入力したい",
]

const BOT_ANSWERS = [
  "メニュー「記録管理」→「日報入力」から入力できます。",
  "「帳票出力」→「請求書」から出力できます。",
  "「利用者管理」→対象者を選択→「編集」ボタンから変更できます。",
  "「報告書」→「月次報告」から作成できます。",
  "「利用者管理」→「新規登録」ボタンから追加できます。",
  "「実績管理」→該当日を選択→「修正」で変更できます。",
]

const STUCK_POINTS = [
  "ボタンが見つからない",
  "画面が固まってしまう",
  "エラーが出て先に進めない",
  "操作の順序がわからない",
  "入力した内容が保存されない",
  "メニューの場所がわからない",
  "期間の指定方法がわからない",
  "印刷プレビューが表示されない",
]

const DESIRED_BEHAVIORS = [
  "ワンクリックで行きたい",
  "もっと分かりやすい場所にボタンを置いてほしい",
  "エラーの原因を教えてほしい",
  "操作マニュアルを画面内で見たい",
  "自動保存してほしい",
  "トップ画面からすぐアクセスしたい",
  "入力例を表示してほしい",
  "前の画面に簡単に戻りたい",
]

const EMOTIONS: Emotion[] = ["困った", "不安", "諦めた", "わからない"]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysBack: number): string {
  const now = new Date()
  const past = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000)
  return past.toISOString()
}

function generateMockFeedback(count: number): Feedback[] {
  const feedbacks: Feedback[] = []

  for (let i = 0; i < count; i++) {
    const resolved = Math.random() > 0.55
    const userIntent = randomItem(USER_INTENTS)
    const botAnswer = randomItem(BOT_ANSWERS)
    const emotion = resolved ? null : randomItem(EMOTIONS)

    feedbacks.push({
      id: `fb-${String(i + 1).padStart(3, "0")}`,
      created_at: randomDate(90),
      session_id: crypto.randomUUID(),
      user_intent: userIntent,
      bot_answer: botAnswer,
      resolved,
      stuck_point: resolved ? null : randomItem(STUCK_POINTS),
      desired_behavior: resolved ? null : randomItem(DESIRED_BEHAVIORS),
      emotion,
      full_conversation: [
        {
          role: "assistant",
          content: "こんにちは！かんたん請求ソフトの操作サポートです。\nどんな操作をしたいですか？",
          timestamp: randomDate(90),
        },
        {
          role: "user",
          content: userIntent,
          timestamp: randomDate(90),
        },
        {
          role: "assistant",
          content: botAnswer,
          timestamp: randomDate(90),
        },
      ],
    })
  }

  return feedbacks.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export const MOCK_FEEDBACKS = generateMockFeedback(48)

export interface FeedbackStats {
  total: number
  resolved: number
  unresolved: number
  emotionCounts: Record<string, number>
}

export function calcStats(feedbacks: Feedback[]): FeedbackStats {
  const resolved = feedbacks.filter((f) => f.resolved).length
  const emotionCounts: Record<string, number> = {}
  for (const f of feedbacks) {
    if (f.emotion) {
      emotionCounts[f.emotion] = (emotionCounts[f.emotion] || 0) + 1
    }
  }
  return {
    total: feedbacks.length,
    resolved,
    unresolved: feedbacks.length - resolved,
    emotionCounts,
  }
}
