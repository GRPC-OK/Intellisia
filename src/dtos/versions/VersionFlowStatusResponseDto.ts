export interface VersionFlowStatusResponseDto {
  versionId: number;
  versionName: string;
  flowStatus: string;
  statuses: {
    code: string;
    build: string;
    image: string;
    approve: string;
    deploy: string;
  };
}
