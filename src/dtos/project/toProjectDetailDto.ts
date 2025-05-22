import { ProjectDetail, Contributor, VersionSummary } from '@/types/project';

export function toProjectDetailDto(
  project: {
    id: number;
    name: string;
    description: string | null;
    githubUrl: string;
    domain: string;
    createdAt: Date;
    updatedAt: Date;
    owner: Contributor | null; // 입력 project의 owner는 null일 수 있음
    contributors: {
      user: Contributor;
    }[];
  },
  versions: VersionSummary[]
): ProjectDetail | null { // 반환 타입 수정: ProjectDetail 또는 null

  // 입력된 project의 owner가 null이면,
  // ProjectDetail 타입의 owner는 null을 허용하지 않으므로
  // 유효한 ProjectDetail 객체를 생성할 수 없습니다.
  if (!project.owner) {
    return null;
  }

  // 이 시점에서 project.owner는 Contributor 타입임이 보장됩니다.
  // 또한, ProjectDetail의 owner 필드가 Contributor 타입이므로,
  // project.owner (null이 아닌 Contributor)를 직접 할당할 수 있다고 가정합니다.
  // 만약 Contributor 타입 내에서 특정 필드만 선택해야 한다면 추가 매핑이 필요합니다.
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? '제공된 설명이 없습니다.',
    githubUrl: project.githubUrl,
    domain: project.domain,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    owner: project.owner, // project.owner는 이제 null이 아닌 Contributor 객체입니다.
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