import prisma from '@/lib/prisma';

export const getVersionsByProject = async (
  projectId: number,
  sort: 'asc' | 'desc'
) => {
  return prisma.version.findMany({
    where: { projectId },
    orderBy: {
      name: sort,
    },
  });
};

export const getVersionStatusById = async (versionId: number) => {
  return prisma.version.findUnique({
    where: { id: versionId },
    select: {
      id: true,
      flowStatus: true,
      codeStatus: true,
      buildStatus: true,
      imageStatus: true,
      approveStatus: true,
      deployStatus: true,
    },
  });
};
