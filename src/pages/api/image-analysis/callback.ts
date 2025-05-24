import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, StepStatus } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { versionId, status, s3Url } = req.body;

  if (!versionId || !status) {
    return res
      .status(400)
      .json({ message: 'Missing versionId or status in request body' });
  }

  if (!['success', 'fail'].includes(status)) {
    return res
      .status(400)
      .json({ message: 'Invalid status value. Must be "success" or "fail".' });
  }

  // s3Url can be null or empty if status is 'fail'
  if (status === 'success' && !s3Url) {
    // return res.status(400).json({ message: 'Missing s3Url for successful analysis.' });
    // Or allow it if Trivy found no issues and S3 upload was thus skipped (though current GHA uploads empty on no issues)
    console.warn(
      `Callback for versionId ${versionId} has status 'success' but no s3Url.`
    );
  }

  try {
    const updatedVersion = await prisma.version.update({
      where: { id: parseInt(versionId as string, 10) },
      data: {
        imageStatus: status as StepStatus,
        imageAnalysisS3Url: s3Url || null,
      },
    });

    if (!updatedVersion) {
      return res.status(404).json({
        message: `Version with ID ${versionId} not found during callback.`,
      });
    }

    console.log(
      `Image analysis status updated for versionId ${versionId}: ${status}, S3 URL: ${s3Url || 'N/A'}`
    );
    return res
      .status(200)
      .json({ message: 'Image analysis status updated successfully.' });
  } catch (error) {
    console.error('Error updating image analysis status:', error);
    // Consider retry mechanisms or logging for critical updates
    return res
      .status(500)
      .json({ message: 'Internal Server Error while updating status' });
  }
}
