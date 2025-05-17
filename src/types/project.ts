export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
}

export type Contributor = Pick<User, 'id' | 'name' | 'avatarUrl'>;

export interface VersionSummary {
  name: string;
  description: string;
  isCurrent: boolean;
}

export interface ProjectDetail {
  id: number;
  name: string;
  description: string;
  githubUrl: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
  owner: Contributor;
  contributors: Contributor[];
  versions: VersionSummary[];
}
export interface Version {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isCurrent: boolean;
  createdBy: {
    id: number;
    name: string;
    avatarUrl: string;
  };
}
