import { ProjectDetail, Contributor, VersionSummary } from '@/types/project';

export function toProjectDetailDto(
  project: {
    id: number;
    name: string;
    description: string;
    githubUrl: string;
    domain: string;
    createdAt: Date;
    updatedAt: Date;
    owner: Contributor;
    contributors: {
      user: Contributor;
    }[];
  },
  versions: VersionSummary[]
): ProjectDetail {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    githubUrl: project.githubUrl,
    domain: project.domain,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    owner: {
      id: project.owner.id,
      name: project.owner.name,
      avatarUrl: project.owner.avatarUrl,
    },
    contributors: project.contributors.map((c) => ({
      id: c.user.id,
      name: c.user.name,
      avatarUrl: c.user.avatarUrl,
    })),
    versions: versions.map((v) => ({
      name: v.name,
      description: v.description,
      isCurrent: v.isCurrent,
    })),
  };
}
