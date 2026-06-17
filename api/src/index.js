require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const webhookRoutes = require('./routes/webhook');
const expenseRoutes = require('./routes/expense');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(morgan('combined'));
app.use(cors({
  origin: [
    process.env.VITE_API_BASE_URL,
    process.env.HQ_WEB_URL
  ].filter(Boolean),
  credentials: true
}));

// LINE Webhook は署名検証のためにrawBodyが必要
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// ルート
app.use('/auth', authRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/admin', adminRoutes);

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// エラーハンドラ
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log('UMAMI経費集計 API サーバー起動 port=' + PORT);
});
