import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

// Prisma ORM 클라이언트 인스턴스 생성
const prisma = new PrismaClient();

// 최신 빌드 완료(성공/실패) 버전의 이미지 태그와 상태를 반환하는 엔드포인트
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // buildStatus가 success 또는 fail인 최신 버전 1개 조회
    const latestVersion = await prisma.version.findFirst({
      where: {
        buildStatus: { in: ['success', 'fail'] },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        imageTag: true,
        buildStatus: true,
      },
    });

    // 빌드 완료된 버전이 없으면 404 반환
    if (!latestVersion) {
      return res.status(404).json({ message: 'No completed build found' });
    }

    // 최신 빌드 정보 반환
    return res.status(200).json(latestVersion);
  } catch {
    // 에러 발생 시 500 반환
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
