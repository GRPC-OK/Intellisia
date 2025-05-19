// test-prisma.ts
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect(); // 명시적으로 연결 시도
    console.log('Database connected successfully!');

    // 간단한 쿼리 실행 (선택 사항)
    const oneProject = await prisma.project.findFirst();
    console.log('Found project:', oneProject);
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
