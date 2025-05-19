import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

console.log('DATABASE_URL from env:', process.env.DATABASE_URL); // 데이터베이스가 제대로 연결되었는지 확인하는 코드. 개발 단계에서만 사용 권장!

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
