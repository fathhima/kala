import { PrismaClient } from '@prisma/client';

import { seedAdmin } from './seeds/admin.seed';
import { seedCategories } from './seeds/category.seed';

const prisma = new PrismaClient();

async function main() {
  await seedAdmin(prisma);
  await seedCategories(prisma)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
