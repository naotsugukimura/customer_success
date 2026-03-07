# VoC収集チャットボット

障害福祉向けSaaSのユーザーサポート用チャットボットと、VoC(Voice of Customer)管理ダッシュボード。

## 構成

| サブシステム | 技術 | ポート |
|---|---|---|
| バックエンド | Node.js + Express + SQLite | 3001 |
| チャットUI | React + Vite | 5173 |
| 管理ダッシュボード | React + Vite | 5174 |

## セットアップ

```bash
# 環境変数を設定
cp .env.example .env
# ANTHROPIC_API_KEY と ADMIN_TOKEN を設定

# バックエンド
cd backend && npm install && npm run dev

# チャットUI（別ターミナル）
cd frontend/chat && npm install && npm run dev

# 管理ダッシュボード（別ターミナル）
cd frontend/admin && npm install && npm run dev
```

## アクセス

- チャットUI: http://localhost:5173
- 管理ダッシュボード: http://localhost:5174
