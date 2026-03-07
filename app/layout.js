import './globals.css';

export const metadata = {
  title: 'VoC収集チャットボット',
  description: '障害福祉SaaS 操作サポート & VoC収集システム',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
