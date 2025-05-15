import prisma from '@/lib/prisma';

export async function getVersionsByProject(
  projectId: number,
  sort: 'asc' | 'desc'
) {
  return await prisma.version.findMany({
    where: { projectId },
    orderBy: {
      name: sort,
    },
  });
}
