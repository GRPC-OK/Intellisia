import type { NextApiRequest, NextApiResponse } from 'next';
import { StepStatus, FlowStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const versionId = Number(req.query.versionId);
  const status = req.query.status as string;
  const imageTag = req.query.imageTag as string | undefined;

  if (isNaN(versionId) || !['success', 'fail'].includes(status)) {
    return res.status(400).json({ error: 'Invalid or missing parameters' });
  }

  try {
    const isSuccess = status === 'success';
    const stepStatus = isSuccess ? StepStatus.success : StepStatus.fail;

    await updateVersionStatusSafely(versionId, {
      buildStatus: stepStatus,
      imageStatus: isSuccess ? StepStatus.pending : undefined,
      flowStatus: isSuccess ? undefined : FlowStatus.fail,
    });

    if (isSuccess && imageTag) {
      await prisma.version.update({
        where: { id: versionId },
        data: { imageTag },
      });
    }

    return res
      .status(200)
      .json({ message: 'Build status updated successfully' });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to update status';
    console.error('[image-build-result] DB update error:', message);
    return res.status(500).json({ error: message });
  }
}
