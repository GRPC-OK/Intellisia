import { Version } from '@prisma/client';

export interface VersionHeader {
  project: {
    id: number;
    name: string;
    ownerName: string;
  };
  version: {
    id: number;
    name: string;
  };
}

export type VersionWithProjectAndAuthor = Version & {
  author: { name: string };
  project: {
    id: number;
    name: string;
    owner: { name: string };
  };
};
