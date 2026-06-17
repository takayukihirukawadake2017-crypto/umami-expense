const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// LINE Login コールバック
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  try {
    // LINE からアクセストークン取得
    const tokenRes = await axios.post('https://api.line.me/oauth2/v2.1/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.VITE_API_BASE_URL.replace('/api', '') + '/auth/callback',
      client_id: process.env.LINE_LOGIN_CHANNEL_ID,
      client_secret: process.env.LINE_CHANNEL_SECRET
    }));

    const { access_token, id_token } = tokenRes.data;

    // プロフィール取得
    const profileRes = await axios.get('https://api.line.me/v2/profile', {
      headers: { Authorization: 'Bearer ' + access_token }
    });

    const { userId, displayName, pictureUrl } = profileRes.data;

    // ユーザー作成 or 更新
    const user = await prisma.user.upsert({
      where: { lineUserId: userId },
      update: { displayName, pictureUrl },
      create: { lineUserId: userId, displayName, pictureUrl, role: 'STAFF' }
    });

    // JWT 発行
    const token = jwt.sign(
      { userId: user.id, lineUserId: userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // フロントエンドへリダイレクト
    const redirectUrl = process.env.VITE_API_BASE_URL.replace('/api', '') + '/?token=' + token;
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Auth callback error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// JWT 検証ミドルウェア
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}

// 管理者権限チェックミドルウェア
function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'HQ') {
    return res.status(403).json({ error: 'Admin required' });
  }
  next();
}

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.requireAdmin = requireAdmin;
