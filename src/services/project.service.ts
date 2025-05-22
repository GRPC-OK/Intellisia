// project.service.ts
import { getProjectById } from '@/repositories/project.repository';
import { getVersionsByProject } from '@/repositories/version.repository';
import { toProjectDetailDto } from '@/dtos/project/toProjectDetailDto';
import { VersionSummary } from '@/types/project';

export const getProjectDetail = async (
  projectId: number,
  sort: 'asc' | 'desc'
) => {
  const project = await getProjectById(projectId);
  if (!project) return null;

  const versions: VersionSummary[] = await getVersionsByProject(
    projectId,
    sort
  );

  return toProjectDetailDto(project, versions);
};
