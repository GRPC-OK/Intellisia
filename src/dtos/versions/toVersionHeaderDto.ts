import { VersionWithProjectAndAuthor, VersionHeader } from '@/types/version';

export const toVersionHeaderDto = (
  version: VersionWithProjectAndAuthor
): VersionHeader => {
  return {
    project: {
      id: version.project.id,
      name: version.project.name,
      ownerName: version.project.owner.name,
    },
    version: {
      id: version.id,
      name: version.name,
    },
  };
};
