const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();

// 経費一覧取得（自分の分）
router.get('/', authenticateToken, async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { lineUserId: req.user.lineUserId },
      orderBy: { submittedAt: 'desc' }
    });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 経費詳細取得
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: req.params.id, lineUserId: req.user.lineUserId }
    });
    if (!expense) return res.status(404).json({ error: 'Not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 経費申請（更新）
router.put('/:id', authenticateToken, async (req, res) => {
  const { amount, description, category, receiptDate } = req.body;

  try {
    const expense = await prisma.expense.findFirst({
      where: { id: req.params.id, lineUserId: req.user.lineUserId }
    });
    if (!expense) return res.status(404).json({ error: 'Not found' });
    if (expense.status !== 'PENDING') {
      return res.status(400).json({ error: '申請済みの経費は編集できません' });
    }

    const updated = await prisma.expense.update({
      where: { id: req.params.id },
      data: { amount, description, category, receiptDate: receiptDate ? new Date(receiptDate) : null, status: 'SUBMITTED' }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 経費申請送信
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: req.params.id, lineUserId: req.user.lineUserId }
    });
    if (!expense) return res.status(404).json({ error: 'Not found' });

    const updated = await prisma.expense.update({
      where: { id: req.params.id },
      data: { status: 'SUBMITTED', submittedAt: new Date() }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
