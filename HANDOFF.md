# HANDOFF.md — 引き継ぎ・運用メモ

## 概要
UMAMI経費集計システムの引き継ぎドキュメントです。
新規テナント構築・運用担当者はまず docs/SETUP_NEW_TENANT.md を読んでください。

---

## 重要: 本部ボタンのリッチメニューURL修正

リッチメニューを作成・再生成する際は必ず以下の手順を守ること。

1. .env.prod の HQ_WEB_URL が新テナントの正しいドメインになっていることを確認
2. docker compose -p PROJECT run --rm api node scripts/setup_richmenu.js を実行
3. 出力された richMenuId を控える
4. ホスト側の secrets/richmenu_ids.json に保存する
5. コンテナ内は read-only マウントのため、ホスト側ファイルへの書き込みが必要

---

## シークレット管理

deploy/.env.prod および deploy/secrets/ は gitignore 対象でコミット禁止。

---

## DB マイグレーション

api コンテナ起動時に prisma migrate deploy と seed が自動実行される（冪等）。

---

## 初期 admin 昇格

docker compose -p PROJECT exec api node scripts/promote_admin.js LINE_USER_ID

---

## フロントエンド再ビルド

VITE_LIFF_ID や VITE_API_BASE_URL を変えた場合は --build で再ビルドすること。
