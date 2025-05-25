import { StepStatus, ApproveStatus, FlowStatus } from '@prisma/client';

export interface VersionFlowStatus {
  codeStatus: StepStatus;
  buildStatus: StepStatus;
  imageStatus: StepStatus;
  approveStatus: ApproveStatus;
  deployStatus: StepStatus;
  flowStatus: FlowStatus;
  versionId: number;
  versionName: string;
}
