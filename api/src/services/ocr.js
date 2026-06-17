const vision = require('@google-cloud/vision');

let client = null;

function getClient() {
  if (!client) {
    client = new vision.ImageAnnotatorClient();
  }
  return client;
}

// 領収書画像からテキストと金額を抽出
async function processReceiptImage(imageBuffer) {
  if (process.env.USE_GOOGLE_VISION !== 'true') {
    return null;
  }

  try {
    const visionClient = getClient();
    const [result] = await visionClient.textDetection({ image: { content: imageBuffer } });
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return { text: '', amount: null };
    }

    const fullText = detections[0].description;

    // 金額抽出（円、¥、税込などのパターン）
    const amount = extractAmount(fullText);

    return { text: fullText, amount };
  } catch (err) {
    console.error('OCR error:', err);
    return { text: '', amount: null };
  }
}

// テキストから金額を抽出する
function extractAmount(text) {
  // 合計、税込、お会計などの行から金額を取得
  const patterns = [
    /合計[\s　]*[¥\\]?([\d,]+)/,
    /税込[\s　]*[¥\\]?([\d,]+)/,
    /お会計[\s　]*[¥\\]?([\d,]+)/,
    /小計[\s　]*[¥\\]?([\d,]+)/,
    /TOTAL[\s]*[¥\\]?([\d,]+)/i,
    /[¥\\]([\d,]+)/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseInt(match[1].replace(/,/g, ''), 10);
      if (amount > 0 && amount < 10000000) {
        return amount;
      }
    }
  }

  return null;
}

module.exports = { processReceiptImage };
