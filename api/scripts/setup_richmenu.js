#!/usr/bin/env node
// リッチメニュー作成スクリプト
// 使い方: docker compose -p PROJECT run --rm api node scripts/setup_richmenu.js
//
// 注意:
// - .env.prod の HQ_WEB_URL が新ドメインになっていることを確認してから実行すること
// - 出力された richMenuId を deploy/secrets/richmenu_ids.json に手動で保存すること
// - コンテナ内は read-only マウントのため、ファイル保存はホスト側で行う

require('dotenv').config();
const axios = require('axios');

const ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const HQ_WEB_URL = process.env.HQ_WEB_URL;
const LIFF_URL = process.env.VITE_API_BASE_URL ? process.env.VITE_API_BASE_URL.replace('/api', '') : '';

if (!ACCESS_TOKEN) {
  console.error('LINE_CHANNEL_ACCESS_TOKEN が設定されていません');
  process.exit(1);
}

if (!HQ_WEB_URL || HQ_WEB_URL.includes('PLACEHOLDER')) {
  console.error('HQ_WEB_URL が正しく設定されていません:', HQ_WEB_URL);
  process.exit(1);
}

const headers = {
  'Authorization': 'Bearer ' + ACCESS_TOKEN,
  'Content-Type': 'application/json'
};

async function createRichMenu(name, areas) {
  const body = {
    size: { width: 2500, height: 843 },
    selected: true,
    name,
    chatBarText: 'メニュー',
    areas
  };

  const res = await axios.post('https://api.line.me/v2/bot/richmenu', body, { headers });
  return res.data.richMenuId;
}

async function main() {
  console.log('リッチメニューを作成します...');
  console.log('HQ_WEB_URL:', HQ_WEB_URL);

  // スタッフ用リッチメニュー
  const staffMenuId = await createRichMenu('スタッフメニュー', [
    {
      bounds: { x: 0, y: 0, width: 1250, height: 843 },
      action: { type: 'uri', uri: LIFF_URL + '/', label: '経費申請' }
    },
    {
      bounds: { x: 1250, y: 0, width: 1250, height: 843 },
      action: { type: 'message', text: '経費確認', label: '経費確認' }
    }
  ]);
  console.log('スタッフメニュー richMenuId:', staffMenuId);

  // 本部用リッチメニュー（HQ_WEB_URLを焼き込む）
  const hqMenuId = await createRichMenu('本部メニュー', [
    {
      bounds: { x: 0, y: 0, width: 1250, height: 843 },
      action: { type: 'uri', uri: HQ_WEB_URL + '/admin', label: '管理画面' }
    },
    {
      bounds: { x: 1250, y: 0, width: 1250, height: 843 },
      action: { type: 'uri', uri: HQ_WEB_URL + '/admin/expenses', label: '経費一覧' }
    }
  ]);
  console.log('本部メニュー richMenuId:', hqMenuId);

  console.log('');
  console.log('以下の内容を deploy/secrets/richmenu_ids.json に保存してください:');
  console.log(JSON.stringify({ staff: staffMenuId, hq: hqMenuId }, null, 2));
}

main().catch(err => {
  console.error('エラー:', err.response ? err.response.data : err.message);
  process.exit(1);
});
