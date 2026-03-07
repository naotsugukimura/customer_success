import type { Emotion, ButtonOption } from "./types"

export const EMOTIONS: { value: Emotion; label: string }[] = [
  { value: "困った", label: "困った" },
  { value: "不安", label: "不安" },
  { value: "諦めた", label: "諦めた" },
  { value: "わからない", label: "わからない" },
]

export const RESOLUTION_BUTTONS: ButtonOption[] = [
  { label: "はい、解決しました", value: "yes", variant: "default" },
  { label: "いいえ、うまくいきませんでした", value: "no", variant: "outline" },
]

export const GREETING_MESSAGE =
  "こんにちは！かんたん請求ソフトの操作サポートです。\nどんな操作をしたいですか？お気軽にご相談ください。"

export const RESOLUTION_MESSAGE =
  "お役に立てましたか？"

export const VOC_INTRO_MESSAGE =
  "うまくいかなかったとのことで申し訳ございません。改善のために、もう少し教えていただけますか？"

export const COMPLETION_RESOLVED_MESSAGE =
  "お役に立てて何よりです！他にご質問があればいつでもお声がけください。"

export const COMPLETION_FEEDBACK_MESSAGE =
  "貴重なご意見ありがとうございます。開発チームに届けます。\n今後のサービス改善に活かしてまいります。"

export const SAMPLE_QUESTIONS = [
  "利用者の記録を入力したい",
  "請求書を出力したい",
  "利用者情報を変更したい",
]
