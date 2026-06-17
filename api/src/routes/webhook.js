const express = require('express');
const line = require('@line/bot-sdk');
const { PrismaClient } = require('@prisma/client');
const { processReceiptImage } = require('../services/ocr');
const { uploadToMinio } = require('../services/storage');

const router = express.Router();
const prisma = new PrismaClient();

const lineConfig = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
};

const client = new line.Client(lineConfig);

// LINE Webhook エンドポイント
router.post('/', line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    await Promise.all(events.map(handleEvent));
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).end();
  }
});

async function handleEvent(event) {
  if (event.type === 'message') {
    if (event.message.type === 'image') {
      await handleReceiptImage(event);
    } else if (event.message.type === 'text') {
      await handleTextMessage(event);
    }
  }
}

async function handleReceiptImage(event) {
  const userId = event.source.userId;
  const messageId = event.message.id;

  try {
    // LINE から画像取得
    const stream = await client.getMessageContent(messageId);
    const imageBuffer = await streamToBuffer(stream);

    // MinIO にアップロード
    const imageUrl = await uploadToMinio(imageBuffer, messageId + '.jpg', 'image/jpeg');

    // OCR 処理（Google Vision）
    let ocrResult = null;
    if (process.env.USE_GOOGLE_VISION === 'true') {
      ocrResult = await processReceiptImage(imageBuffer);
    }

    // 経費申請レコード作成（仮登録）
    const expense = await prisma.expense.create({
      data: {
        lineUserId: userId,
        imageUrl,
        ocrText: ocrResult ? ocrResult.text : null,
        amount: ocrResult ? ocrResult.amount : null,
        status: 'PENDING',
        submittedAt: new Date()
      }
    });

    // 確認メッセージ返信
    const message = ocrResult && ocrResult.amount
      ? '領収書を受け取りました！\n金額: ' + ocrResult.amount + '円\n申請ID: ' + expense.id + '\n内容を確認してLIFFアプリから申請してください。'
      : '領収書画像を受け取りました！\n申請ID: ' + expense.id + '\nLIFFアプリから金額と内容を入力して申請してください。';

    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: message
    });
  } catch (err) {
    console.error('Receipt processing error:', err);
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '画像の処理中にエラーが発生しました。もう一度お試しください。'
    });
  }
}

async function handleTextMessage(event) {
  const text = event.message.text;
  // コマンド処理など（今後拡張）
  if (text === '経費確認') {
    const userId = event.source.userId;
    const expenses = await prisma.expense.findMany({
      where: { lineUserId: userId, status: 'PENDING' },
      orderBy: { submittedAt: 'desc' },
      take: 5
    });

    const reply = expenses.length > 0
      ? '未申請の経費:\n' + expenses.map(e => '- ID:' + e.id + ' ' + (e.amount ? e.amount + '円' : '金額未設定')).join('\n')
      : '未申請の経費はありません。';

    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: reply
    });
  }
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

module.exports = router;
