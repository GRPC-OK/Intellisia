import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';
import type { StepStatus, FlowStatus } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { versionId: versionIdRaw, status, fileUrl } = req.body;
  const versionId = parseInt(versionIdRaw as string, 10);

  if (!versionId || !status || !fileUrl) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const isSuccess = status === 'success';
    const imageStatus: StepStatus = isSuccess ? 'success' : 'fail';
    const flowStatus: FlowStatus | undefined = isSuccess ? undefined : 'fail';

    await prisma.version.update({
      where: { id: versionId },
      data: {
        imageAnalysisS3Url: fileUrl,
      },
    });

    await updateVersionStatusSafely(versionId, {
      imageStatus,
      ...(flowStatus && { flowStatus }),
    });

    return res.status(200).json({
      message: `Image analysis result updated for versionId ${versionId}`,
    });
  } catch (err) {
    console.error('[callback_analysis.ts] DB update error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
