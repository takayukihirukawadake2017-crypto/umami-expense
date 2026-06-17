# LINE_SETUP.md — LINE チャンネル設定手順

## 1. Messaging API チャンネルの設定

### 1-1. チャンネル作成
1. LINE Developers (https://developers.line.biz/) にログイン
2. プロバイダー選択 > 「新規チャンネル作成」
3. 「Messaging API」を選択
4. 必要情報を入力してチャンネルを作成

### 1-2. Channel Secret の取得
- チャンネル設定 > 「チャンネル基本設定」タブ
- 「Channel secret」をコピーして .env.prod の LINE_CHANNEL_SECRET に設定

### 1-3. 長期アクセストークンの発行
- チャンネル設定 > 「Messaging API設定」タブ
- 「チャンネルアクセストークン（長期）」の「発行」をクリック
- 発行されたトークンを .env.prod の LINE_CHANNEL_ACCESS_TOKEN に設定

### 1-4. Webhook の設定
- チャンネル設定 > 「Messaging API設定」タブ
- Webhook URL: https://liff.example.com/webhook
- 「Webhookの利用」をオン
- 「検証」ボタンで動作確認

---

## 2. LINE Login チャンネルの設定

### 2-1. チャンネル作成
1. LINE Developers > 「新規チャンネル作成」
2. 「LINE Login」を選択
3. 必要情報を入力してチャンネルを作成

### 2-2. Channel ID の取得
- チャンネル設定 > 「チャンネル基本設定」タブ
- 「Channel ID」をコピーして .env.prod の LINE_LOGIN_CHANNEL_ID に設定

### 2-3. Callback URL の設定
- チャンネル設定 > 「LINE Loginの設定」タブ
- コールバックURL: https://liff.example.com/auth/callback

---

## 3. LIFF の設定

### 3-1. LIFF アプリの作成
1. LINE Login チャンネル > 「LIFF」タブ
2. 「追加」をクリック
3. 設定値:
   - LIFFアプリ名: UMAMI経費申請
   - サイズ: Full
   - エンドポイントURL: https://liff.example.com/
   - Scope: profile, openid
   - ボットリンク機能: On (Aggressive)

### 3-2. LIFF ID の取得
- LIFF作成後に表示される LIFF ID をコピー
- .env.prod の VITE_LIFF_ID に設定
- フロントエンドのビルド時に焼き込まれる（実行時差し替え不可）

---

## 4. .env.prod への反映

LINE関連の環境変数:

LINE_CHANNEL_SECRET=（Channel Secretを入力）
LINE_CHANNEL_ACCESS_TOKEN=（長期アクセストークンを入力）
LINE_LOGIN_CHANNEL_ID=（LINE Login Channel IDを入力）
VITE_LIFF_ID=（LIFF IDを入力）

---

## 5. 動作確認

1. LINEの公式アカウントを友だち追加
2. メッセージを送信してWebhookが動作するか確認
3. LIFFアプリを開いてLINE Loginが動作するか確認
