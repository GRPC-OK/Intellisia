export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  githubUrl: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  contributors: User[];
  versions: VersionSummary[];
}

export interface Version {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isCurrent: boolean;
  createdBy: User;
}

export interface VersionSummary {
  name: string;
  description: string;
  isCurrent?: boolean;
}
