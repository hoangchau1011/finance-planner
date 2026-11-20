import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { ROWS, WISHLIST } from './seed-data';

export const DEMO_EMAIL = 'demo@phy10615.vn';

async function main() {
  if (ROWS.length < 30) throw new Error('Seed must contain at least 30 transactions.');
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: 'Sinh viên demo' },
    create: {
      email: DEMO_EMAIL,
      name: 'Sinh viên demo',
      emailVerified: false,
    },
  });

  const transactions = await prisma.transaction.createMany({
    data: ROWS.map((row, index) => ({
      ...row,
      id: `fp1-transaction-${String(index + 1).padStart(3, '0')}`,
      userId: user.id,
    })),
    skipDuplicates: true,
  });

  const wishlist = await prisma.wishlistItem.createMany({
    data: WISHLIST.map((item, index) => ({
      ...item,
      id: `fp1-wishlist-${index + 1}`,
      userId: user.id,
    })),
    skipDuplicates: true,
  });

  const total = await prisma.transaction.count({ where: { userId: user.id } });
  console.info(`Demo user: ${DEMO_EMAIL}`);
  console.info(`New transactions: ${transactions.count}; total: ${total}; wishlist: ${wishlist.count} new.`);
  console.info('fp1 demo user has NO login password. Better Auth email/password is implemented in fp3.');
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
