# GOOGLE_SETUP.md — Google Cloud 設定手順

## 概要

Google Vision API（OCR）と Google Sheets API を使用する場合の設定手順です。
使用しない場合はこのドキュメントをスキップしてください。

---

## 1. Google Cloud プロジェクトの準備

1. Google Cloud Console (https://console.cloud.google.com/) にログイン
2. 既存プロジェクトを選択 or 新規プロジェクトを作成
3. 以下のAPIを有効化:
   - Cloud Vision API
   - Google Sheets API

---

## 2. サービスアカウントの作成

1. Cloud Console > 「IAMと管理」 > 「サービスアカウント」
2. 「サービスアカウントを作成」をクリック
3. サービスアカウント名を入力（例: umami-expense-sa）
4. ロールを付与:
   - Cloud Vision APIを使用: 「Cloud Vision ユーザー」
   - Sheetsを使用: 「編集者」または最小権限
5. 「完了」をクリック

---

## 3. サービスアカウントキーの取得

1. 作成したサービスアカウントをクリック
2. 「キー」タブ > 「鍵を追加」 > 「新しい鍵を作成」
3. キーのタイプ: JSON
4. 「作成」をクリックすると JSON ファイルがダウンロードされる
5. ダウンロードした JSON ファイルを deploy/secrets/google-key.json として保存

注意: google-key.json は gitignore 対象。絶対にコミットしないこと。

---

## 4. Google Sheets の準備

1. Google Sheets (https://sheets.google.com/) で新規スプレッドシートを作成
2. スプレッドシートのURLからIDを取得:
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
3. スプレッドシートをサービスアカウントのメールアドレスと共有（編集者権限）

---

## 5. .env.prod への反映

GOOGLE_APPLICATION_CREDENTIALS=/run/secrets/google-key.json
GOOGLE_SPREADSHEET_ID=（スプレッドシートIDを入力）
USE_GOOGLE_VISION=true
USE_GOOGLE_SHEETS=true

---

## 6. 使用しない場合

Google OCR / Sheets を使用しない場合は以下を設定:

USE_GOOGLE_VISION=false
USE_GOOGLE_SHEETS=false

google-key.json の配置は不要です。
