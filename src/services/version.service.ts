import {
  getVersionsByProject,
  getVersionStatusById,
} from '@/repositories/version.repository';
import { VersionFlowStatus } from '@/types/version-flow';
import { toVersionSummaryList } from '@/dtos/versions/toVersionSummaryList';

export const getVersionFlowStatus = async (
  versionId: number
): Promise<VersionFlowStatus | null> => {
  const version = await getVersionStatusById(versionId);
  if (!version) return null;

  return {
    codeStatus: version.codeStatus,
    buildStatus: version.buildStatus,
    imageStatus: version.imageStatus,
    approveStatus: version.approveStatus,
    deployStatus: version.deployStatus,
    flowStatus: version.flowStatus,
    versionId: version.id,
    versionName: version.name,
  };
};

export const getVersionsOfProject = async (
  projectId: number,
  sort: 'asc' | 'desc'
) => {
  const versions = await getVersionsByProject(projectId, sort);
  return toVersionSummaryList(versions);
};
