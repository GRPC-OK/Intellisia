import prisma from '@/lib/prisma';
import { StepStatus, ApproveStatus, FlowStatus } from '@prisma/client';

export async function updateVersionStatusSafely(
  versionId: number,
  update: Partial<{
    codeStatus: StepStatus;
    buildStatus: StepStatus;
    imageStatus: StepStatus;
    approveStatus: ApproveStatus;
    deployStatus: StepStatus;
    flowStatus: FlowStatus;
  }>
) {
  for (let i = 0; i < 2; i++) {
    const current = await prisma.version.findUnique({
      where: { id: versionId },
      select: {
        updatedAt: true,
        codeStatus: true,
        buildStatus: true,
        imageStatus: true,
        deployStatus: true,
        approveStatus: true,
        flowStatus: true,
      },
    });

    if (!current) throw new Error('Version not found');

    const willBeCodeSuccess =
      (update.codeStatus ?? current.codeStatus) === 'success';
    const willBeImageSuccess =
      (update.imageStatus ?? current.imageStatus) === 'success';

    const shouldUpdateApprove =
      current.approveStatus === 'none' &&
      willBeCodeSuccess &&
      willBeImageSuccess;

    const nextApproveStatus = shouldUpdateApprove
      ? 'pending'
      : (update.approveStatus ?? current.approveStatus);

    const result = await prisma.version.updateMany({
      where: {
        id: versionId,
        updatedAt: current.updatedAt,
      },
      data: {
        codeStatus: update.codeStatus ?? current.codeStatus,
        buildStatus: update.buildStatus ?? current.buildStatus,
        imageStatus: update.imageStatus ?? current.imageStatus,
        deployStatus: update.deployStatus ?? current.deployStatus,
        approveStatus: nextApproveStatus,
        flowStatus: update.flowStatus ?? current.flowStatus,
      },
    });

    if (result.count > 0) return;
  }

  throw new Error('동시 업데이트 충돌 발생 — 재시도 2회 실패');
}
