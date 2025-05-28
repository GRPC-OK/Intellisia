import prisma from '@/lib/prisma';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';

export async function handleSemgrepResult(
  versionId: number,
  status: 'success' | 'fail',
  fileUrl: string
) {
  const isSuccess = status === 'success';

  if (!isSuccess) {
    await prisma.codeAnalysis.upsert({
      where: { versionId },
      update: {
        errorLogUrl: fileUrl,
        sarifUrl: null,
        status: 'failed',
      },
      create: {
        versionId,
        errorLogUrl: fileUrl,
        sarifUrl: null,
        status: 'failed',
      },
    });

    await updateVersionStatusSafely(versionId, {
      codeStatus: 'fail',
      flowStatus: 'fail',
    });

    return;
  }

  await prisma.codeAnalysis.upsert({
    where: { versionId },
    update: {
      errorLogUrl: null,
      sarifUrl: fileUrl,
      status: 'passed_with_issues',
    },
    create: {
      versionId,
      errorLogUrl: null,
      sarifUrl: fileUrl,
      status: 'passed_with_issues',
    },
  });

  await updateVersionStatusSafely(versionId, {
    codeStatus: 'success',
  });

  await updateVersionStatusSafely(versionId, {});
}
