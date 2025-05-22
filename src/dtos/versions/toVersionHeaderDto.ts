import { Version } from '@prisma/client';
import { VersionHeader } from '@/types/version';

type VersionWithProjectAndAuthor = Version & {
  author: { name: string };
  project: {
    id: number;
    name: string;
    owner: { name: string };
  };
};

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
