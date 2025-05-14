// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// ---------------------------------------------
// global 객체에 prisma 속성이 있음을 타입스크립트에 선언
// ESLint 경고가 발생할 수 있어 eslint-disable-next-line no-var를 추가합니다.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined; // prisma 속성이 PrismaClient 타입이거나 undefined일 수 있음을 선언
}
// ---------------------------------------------

// 개발 환경에서 Hot Module Replacement 시 PrismaClient 인스턴스가 여러 개 생성되는 것을 방지
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default prisma;
