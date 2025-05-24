import { ProjectDetail, Contributor } from '@/types/project';

export function toProjectDetailDto(project: {
  id: number;
  name: string;
  description: string | null;
  githubUrl: string;
  domain: string;
  createdAt: Date;
  updatedAt: Date;
  owner: Contributor;
  contributors: {
    user: Contributor;
  }[];
}): ProjectDetail {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? '제공된 설명이 없습니다.',
    githubUrl: project.githubUrl,
    domain: project.domain,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    owner: project.owner,
    contributors: project.contributors.map((c) => ({
      id: c.user.id,
      name: c.user.name,
      avatarUrl: c.user.avatarUrl,
    })),
  };
}
