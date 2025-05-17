import { getVersionStatusById } from '@/repositories/version.repository';
import { VersionFlowStatusResponseDto } from '@/dtos/versions/VersionFlowStatusResponseDto';

export const getVersionFlowStatus = async (
  versionId: number
): Promise<VersionFlowStatusResponseDto | null> => {
  const version = await getVersionStatusById(versionId);
  if (!version) return null;

  return {
    versionId: version.id,
    flowStatus: version.flowStatus,
    statuses: {
      code: version.codeStatus,
      build: version.buildStatus,
      image: version.imageStatus,
      approve: version.approveStatus,
      deploy: version.deployStatus,
    },
  };
};
