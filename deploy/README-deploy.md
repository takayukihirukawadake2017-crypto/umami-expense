# README-deploy.md — デプロイ手順

## ディレクトリ構成

deploy/
  docker-compose.yml     本番用 Docker Compose 設定
  Caddyfile              リバースプロキシ設定（要ドメイン書換）
  .env.example           環境変数テンプレート
  .env.prod              実際の環境変数（gitignore・コミット禁止）
  secrets/
    google-key.json      Google サービスアカウント鍵（gitignore）
    richmenu_ids.json    LINE リッチメニューID（gitignore）

---

## 初回デプロイ手順

1. Caddyfile のドメインを実際のドメインに書き換える
2. .env.prod を作成して全ての値を設定する
3. secrets/ ディレクトリを作成して必要なファイルを配置する

mkdir -p deploy/secrets
touch deploy/secrets/richmenu_ids.json

4. 初回ビルドとデプロイを実行する（事前に確認すること）

cd deploy
docker compose -p umami-expense up -d --build

5. ログを確認する

docker compose -p umami-expense logs -f

---

## サービス構成

| サービス名 | 説明 | ポート |
|---|---|---|
| api | Node.js バックエンドAPI | 3000（内部） |
| frontend | Vite + React フロントエンド | 5173（内部） |
| db | PostgreSQL データベース | 5432（内部） |
| minio | MinIO オブジェクトストレージ | 9000/9001（内部） |
| caddy | リバースプロキシ / SSL終端 | 80/443（外部公開） |

---

## よく使うコマンド

# 全サービスの状態確認
docker compose -p umami-expense ps

# ログ確認（全サービス）
docker compose -p umami-expense logs -f

# APIのログのみ
docker compose -p umami-expense logs -f api

# 再起動
docker compose -p umami-expense restart api

# フロントエンド再ビルド（VITE_*変数変更時）
docker compose -p umami-expense up -d --build frontend

# 全停止
docker compose -p umami-expense down

# 全停止 + ボリューム削除（データ消去注意）
docker compose -p umami-expense down -v

---

## バックアップ

# DBバックアップ
docker compose -p umami-expense exec db pg_dump -U postgres umami_expense > backup.sql

# DBリストア
docker compose -p umami-expense exec -T db psql -U postgres umami_expense < backup.sql

---

## トラブルシューティング

### ビルドが失敗する
- VITE_LIFF_ID が空または PLACEHOLDER になっていないか確認
- .env.prod の値が全て設定されているか確認

### Webhookが動作しない
- Caddyのログを確認: docker compose -p umami-expense logs caddy
- LINE Developers でWebhook URLが正しく設定されているか確認
- サーバーのファイアウォールで80/443ポートが開いているか確認

### DBに接続できない
- docker compose -p umami-expense logs db でDB起動ログを確認
- .env.prod の POSTGRES_PASSWORD が正しいか確認
