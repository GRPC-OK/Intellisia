import { Prisma } from '@prisma/client';

function parseVersion(version: string): [number, number, number] {
  const [major, minor, patch] = version.split('.').map(Number);
  return [major, minor, patch];
}

function nextVersion(prev: string): string {
  const [major, minor, patch] = parseVersion(prev);

  if (patch + 5 < 10) {
    return `${major}.${minor}.${patch + 5}`;
  } else if (minor < 9) {
    return `${major}.${minor + 1}.0`;
  } else {
    return `${major + 1}.0.0`;
  }
}

export async function createVersionWithAutoName(
  tx: Prisma.TransactionClient,
  projectId: number,
  data: Omit<Prisma.VersionCreateInput, 'name'>
) {
  const MAX_RETRIES = 5;
  let attempt = 0;

  const latest = await tx.version.findFirst({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });

  let currentName = latest?.name ?? '1.0.0';

  while (attempt < MAX_RETRIES) {
    const newName = nextVersion(currentName);

    try {
      return await tx.version.create({
        data: {
          ...data,
          name: newName,
        },
      });
    } catch (e: unknown) {
      const isP2002 =
        e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';

      if (isP2002) {
        attempt++;
        currentName = newName;
        continue;
      }

      console.error('[버전 생성 실패 - 예상 못 한 Prisma 에러]');
      console.error('typeof e:', typeof e);
      console.error(
        'e instanceof PrismaClientKnownRequestError:',
        e instanceof Prisma.PrismaClientKnownRequestError
      );
      console.error(
        'e instanceof PrismaClientUnknownRequestError:',
        e instanceof Prisma.PrismaClientUnknownRequestError
      );
      console.dir(e, { depth: 10 });

      throw e;
    }
  }

  throw new Error('버전 생성 실패: 중복 충돌이 계속 발생했습니다.');
}
