import prisma from '@/lib/prisma';

export const getProjectById = async (projectId: number) => {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: true,
      contributors: {
        include: { user: true },
      },
    },
  });
};
