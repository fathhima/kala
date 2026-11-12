import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedAdmin(prisma: PrismaClient) {
  const rawEmail = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!rawEmail || !password) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Admin seed skipped: SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD missing');
      return;
    }
    throw new Error('Admin seed env vars missing');
  }

  const email = rawEmail.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    try {
      await prisma.user.create({
        data: {
          name: 'Admin',
          email,
          password: await bcrypt.hash(password, 12),
          roles: ['ADMIN'],
          isVerified: true,
          isActive: true,
        },
      });
      console.log(`✅ Admin seeded: ${email}`);
    } catch (error: any) {
      if (error?.code === 'P2002') {
        console.log(`ℹ️ Admin already seeded by another instance: ${email}`);
        return;
      }
      throw error;
    }
    return;
  }

  const needsAdminRole = !existing.roles.includes('ADMIN');
  const needsPassword = !existing.password;

  if (needsAdminRole || needsPassword || !existing.isVerified) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        ...(needsAdminRole ? { roles: { set: [...existing.roles, 'ADMIN'] } } : {}),
        ...(needsPassword ? { password: await bcrypt.hash(password, 12) } : {}),
        ...(existing.isVerified ? {} : { isVerified: true }),
      },
    });
    console.log(`✅ Admin user updated: ${email}`);
    return;
  }

  console.log(`ℹ️ Admin already exists: ${email}`);
}
