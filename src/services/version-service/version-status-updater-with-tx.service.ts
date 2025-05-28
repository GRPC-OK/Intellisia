import type {
  Prisma,
  StepStatus,
  ApproveStatus,
  FlowStatus,
} from '@prisma/client';

export async function updateVersionStatusSafelyWithTx(
  tx: Prisma.TransactionClient,
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
  for (let attempt = 0; attempt < 2; attempt++) {
    const current = await tx.version.findUnique({
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

    const result = await tx.version.updateMany({
      where: {
        id: versionId,
        updatedAt: current.updatedAt,
      },
      data: {
        codeStatus: update.codeStatus ?? current.codeStatus,
        buildStatus: update.buildStatus ?? current.buildStatus,
        imageStatus: update.imageStatus ?? current.imageStatus,
        deployStatus: update.deployStatus ?? current.deployStatus,
        approveStatus: update.approveStatus ?? current.approveStatus,
        flowStatus: update.flowStatus ?? current.flowStatus,
      },
    });

    if (result.count > 0) return; // 성공적으로 업데이트됨
  }

  throw new Error('동시 업데이트 충돌 발생 — 재시도 2회 실패');
}
