import prisma from '@/lib/prisma';

const defaultProjectInclude = {
  owner: true,
  contributors: {
    include: { user: true },
  },
};

export const getProjectById = async (projectId: number) => {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: defaultProjectInclude,
  });
};

export const getProjectByName = async (name: string) => {
  return prisma.project.findUnique({
    where: { name },
    include: defaultProjectInclude,
  });
};
