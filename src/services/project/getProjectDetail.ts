import { getProjectById } from '@/repositories/project/getProjectById';
import { getVersionsByProject } from '@/repositories/version/getVersionsByProject';
import { toProjectDetailDto } from '@/dtos/project/toProjectDetailDto';
import { VersionSummary } from '@/types/project';

export async function getProjectDetail(
  projectId: number,
  sort: 'asc' | 'desc'
) {
  const project = await getProjectById(projectId);
  if (!project) return null;

  const versions: VersionSummary[] = await getVersionsByProject(
    projectId,
    sort
  );
  return toProjectDetailDto(project, versions);
}
