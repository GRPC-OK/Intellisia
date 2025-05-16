import prisma from '@/lib/prisma';

export async function getProjectById(projectId: number) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: true,
      contributors: {
        include: { user: true },
      },
    },
  });
}
