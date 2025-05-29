import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';
import type { StepStatus, FlowStatus } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { status, fileUrl, versionId } = req.body;

  if (!status || !fileUrl || !versionId) {
    return res.status(400).json({
      message: 'Missing required fields: status, fileUrl, versionId',
    });
  }

  const parsedVersionId = parseInt(versionId, 10);
  if (isNaN(parsedVersionId)) {
    return res.status(400).json({ message: 'Invalid versionId' });
  }

  try {
    const isSuccess = status === 'success';
    const imageStatus: StepStatus = isSuccess ? 'success' : 'fail';
    const flowStatus: FlowStatus | undefined = isSuccess ? undefined : 'fail';

    await prisma.version.update({
      where: { id: parsedVersionId },
      data: {
        imageAnalysisS3Url: fileUrl,
        imageStatus,
      },
    });

    await updateVersionStatusSafely(parsedVersionId, {
      imageStatus,
      ...(flowStatus && { flowStatus }),
    });

    return res.status(200).json({
      message: 'Image analysis callback processed successfully',
      versionId: parsedVersionId,
      status,
    });

  } catch (error) {
    console.error('[IMAGE ANALYSIS CALLBACK ERROR]', error);
    return res.status(500).json({
      message: 'Failed to process image analysis callback',
      error: String(error),
    });
  }
}
