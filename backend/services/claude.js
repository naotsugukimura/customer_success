const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

const SYSTEM_PROMPT = `あなたは障害福祉SaaSの操作サポートボットです。
ユーザーが操作に困っている場合、以下のルールに従って回答してください。

## 回答ルール
- 簡潔に、ステップ形式で説明してください
- 操作手順は番号付きリストで示してください
- 不明な点がある場合は「確認が必要です」と正直に伝えてください
- 敬語を使い、親しみやすいトーンで回答してください

## 対応可能な操作カテゴリ
- 利用者情報の登録・編集
- 日々の記録入力
- 請求データの作成
- 帳票の出力
- スタッフのシフト管理
- その他の設定変更

マニュアルに記載がない操作や、システムの不具合と思われる場合は、
「サポート窓口へのお問い合わせをお勧めします」と案内してください。`;

async function* streamChat(message, history) {
  const messages = [
    ...history,
    { role: 'user', content: message }
  ];

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
}

module.exports = { streamChat };
