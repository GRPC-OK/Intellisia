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
