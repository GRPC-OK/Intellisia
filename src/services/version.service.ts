import {
  getVersionsByProject,
  getVersionStatusById,
} from '@/repositories/version.repository';
import { VersionFlowStatusResponseDto } from '@/dtos/versions/VersionFlowStatusResponseDto';
import { toVersionSummaryList } from '@/dtos/versions/toVersionSummaryList';

export const getVersionFlowStatus = async (
  versionId: number
): Promise<VersionFlowStatusResponseDto | null> => {
  const version = await getVersionStatusById(versionId);
  if (!version) return null;

  return {
    versionId: version.id,
    flowStatus: version.flowStatus,
    versionName: version.name,
    statuses: {
      code: version.codeStatus,
      build: version.buildStatus,
      image: version.imageStatus,
      approve: version.approveStatus,
      deploy: version.deployStatus,
    },
  };
};

export const getVersionsOfProject = async (
  projectId: number,
  sort: 'asc' | 'desc'
) => {
  const versions = await getVersionsByProject(projectId, sort);
  return toVersionSummaryList(versions);
};
