export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  contributors: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }[];
  versions: Version[];
}

export interface Version {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isCurrent: boolean;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}
