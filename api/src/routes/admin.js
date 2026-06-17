const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();

// 全経費一覧（管理者用）
router.get('/expenses', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, from, to, userId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (userId) where.lineUserId = userId;
    if (from || to) {
      where.submittedAt = {};
      if (from) where.submittedAt.gte = new Date(from);
      if (to) where.submittedAt.lte = new Date(to);
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      include: { user: true }
    });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 経費承認
router.put('/expenses/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: req.user.userId
      }
    });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 経費却下
router.put('/expenses/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  const { reason } = req.body;
  try {
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedBy: req.user.userId,
        rejectionReason: reason
      }
    });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ユーザー一覧
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 集計サマリ
router.get('/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [pending, submitted, approved, total] = await Promise.all([
      prisma.expense.count({ where: { status: 'PENDING' } }),
      prisma.expense.count({ where: { status: 'SUBMITTED' } }),
      prisma.expense.count({ where: { status: 'APPROVED' } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { status: 'APPROVED' } })
    ]);

    res.json({
      pending,
      submitted,
      approved,
      totalApprovedAmount: total._sum.amount || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
