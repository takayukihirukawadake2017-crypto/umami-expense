#!/usr/bin/env node
// 使い方: node scripts/promote_admin.js <LINE_USER_ID>
// 例: docker compose -p umami-expense exec api node scripts/promote_admin.js Uxxxxxxxxxx

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const lineUserId = process.argv[2];

  if (!lineUserId) {
    console.error('使い方: node scripts/promote_admin.js <LINE_USER_ID>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { lineUserId } });

  if (!user) {
    console.error('ユーザーが見つかりません:', lineUserId);
    console.error('先にLINEでメッセージを送ってユーザー登録してください。');
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { lineUserId },
    data: { role: 'ADMIN' }
  });

  console.log('ADMINに昇格しました:');
  console.log('  lineUserId:', updated.lineUserId);
  console.log('  displayName:', updated.displayName);
  console.log('  role:', updated.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
