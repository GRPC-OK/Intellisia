import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

function parseVersion(version: string): [number, number, number] {
  const [major, minor, patch] = version.split('.').map(Number);
  return [major, minor, patch];
}

function nextVersion(prev: string): string {
  const [major, minor, patch] = parseVersion(prev);

  if (patch < 5) {
    return `${major}.${minor}.${patch + 5}`;
  }

  if (minor < 9) {
    return `${major}.${minor + 1}.0`;
  }

  return `${major + 1}.0.0`;
}

export async function createVersionWithAutoName(
  projectId: number,
  data: Omit<Prisma.VersionCreateInput, 'name'>
) {
  const MAX_RETRIES = 5;
  let attempt = 0;

  // 최초 버전 기준 추출
  const latest = await prisma.version.findFirst({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });

  let currentName = latest ? latest.name : '1.0.0';

  while (attempt < MAX_RETRIES) {
    const newName = attempt === 0 ? currentName : nextVersion(currentName);

    try {
      return await prisma.version.create({
        data: {
          ...data,
          name: newName,
        },
      });
    } catch (e: unknown) {
      if (
        typeof e === 'object' &&
        e !== null &&
        'code' in e &&
        (e as { code: string }).code === 'P2002'
      ) {
        attempt++;
        currentName = newName;
        continue;
      }

      throw e;
    }
  }

  throw new Error('버전 생성 실패: 중복 충돌이 계속 발생했습니다.');
}
