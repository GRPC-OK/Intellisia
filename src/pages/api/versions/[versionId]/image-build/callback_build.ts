import type { NextApiRequest, NextApiResponse } from 'next';
import { StepStatus, FlowStatus } from '@prisma/client';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const versionId = Number(req.query.versionId);
  const status = req.query.status as string;

  if (isNaN(versionId) || !['success', 'fail'].includes(status)) {
    return res.status(400).json({ error: 'Invalid or missing parameters' });
  }

  try {
    const isSuccess = status === 'success';
    const stepStatus = isSuccess ? StepStatus.success : StepStatus.fail;

    // buildStatus, imageStatus 업데이트
    await updateVersionStatusSafely(versionId, {
      buildStatus: stepStatus,
      imageStatus: stepStatus,
      flowStatus: isSuccess ? undefined : FlowStatus.fail, // 실패 시 flow도 종료
    });

    // 병렬성 대비 보정 호출
    if (isSuccess) {
      await updateVersionStatusSafely(versionId, {});
    }

    return res
      .status(200)
      .json({ message: 'Build and image status updated successfully' });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to update status';
    console.error('[image-build-result] DB update error:', message);
    return res.status(500).json({ error: message });
  }
}
