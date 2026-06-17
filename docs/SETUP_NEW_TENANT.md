# SETUP_NEW_TENANT.md — 新規テナント構築手順（正本）

## 前提条件

- Docker / docker compose がインストール済みのVM
- 公開ドメイン 3 つ（DNS設定済み）
  - liff.example.com    申請LIFF用
  - hq.example.com      本部・管理PC用
  - img.example.com     領収書画像（MinIO）用
- LINE Messaging API チャンネル作成済み
- LINE Login チャンネル作成済み（LIFF設定済み）

---

## 1. 必要情報チェックリスト

| 項目 | 値 |
|---|---|
| LIFF用ドメイン | liff.example.com |
| 本部用ドメイン | hq.example.com |
| 画像用ドメイン | img.example.com |
| VMのIPアドレス | xxx.xxx.xxx.xxx |
| LINE Channel Secret | Messaging APIチャンネルから取得 |
| LINE長期アクセストークン | Messaging APIから発行 |
| LINE Login Channel ID | LINE Loginチャンネルから取得 |
| LIFF ID | LINE DevelopersでLIFF登録後に取得 |

---

## 2. 構築手順

### Step 1: リポジトリのクローン

git clone https://github.com/takayukihirukawadake2017-crypto/umami-expense.git
cd umami-expense

### Step 2: Caddyfile のドメイン書換

deploy/Caddyfile を編集し、全ての PLACEHOLDER を実際のドメインに置換する。

sed -i 's/LIFF_DOMAIN/liff.example.com/g' deploy/Caddyfile
sed -i 's/HQ_DOMAIN/hq.example.com/g' deploy/Caddyfile
sed -i 's/IMG_DOMAIN/img.example.com/g' deploy/Caddyfile

### Step 3: .env.prod の作成

cp deploy/.env.example deploy/.env.prod

deploy/.env.prod を編集して全ての値を埋める。
シークレット値は以下で自動生成:

echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "POSTGRES_PASSWORD=$(openssl rand -hex 16)"
echo "MINIO_ROOT_USER=$(openssl rand -hex 10)"
echo "MINIO_ROOT_PASSWORD=$(openssl rand -hex 20)"

### Step 4: 初回デプロイ（確認後に実行すること）

cd deploy
docker compose -p umami-expense up -d --build

ログ確認:
docker compose -p umami-expense logs -f api

### Step 5: LINE Webhook / エンドポイント更新

LINE Developers コンソールで以下を更新する:
- Messaging API > Webhook URL: https://liff.example.com/webhook
- LINE Login > Callback URL: https://liff.example.com/auth/callback

詳細: docs/LINE_SETUP.md

### Step 6: リッチメニュー作成

.env.prod の HQ_WEB_URL が正しいドメインであることを確認してから実行すること。

docker compose -p umami-expense run --rm api node scripts/setup_richmenu.js

出力された richMenuId を deploy/secrets/richmenu_ids.json に保存する。
詳細: HANDOFF.md

### Step 7: 初期 admin 昇格

docker compose -p umami-expense exec api node scripts/promote_admin.js LINE_USER_ID

---

## 3. 参照ドキュメント

- docs/LINE_SETUP.md
- docs/GOOGLE_SETUP.md
- deploy/README-deploy.md
- HANDOFF.md
