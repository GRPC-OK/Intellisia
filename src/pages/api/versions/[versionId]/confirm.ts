import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { triggerSemgrepWorkflow } from '@/services/code-analysis-service/code-analysis-dispatcher';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method Not Allowed' });

  const versionId = Number(req.query.versionId);
  if (isNaN(versionId))
    return res.status(400).json({ message: 'Invalid versionId' });

  try {
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      include: { project: true },
    });

    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    await updateVersionStatusSafely(versionId, {
      codeStatus: 'pending',
      flowStatus: 'pending',
    });

    await triggerSemgrepWorkflow({
      versionId,
      repoUrl: version.project.githubUrl,
      branch: version.branch,
    });

    return res.status(200).json({ message: '정적 분석 트리거 완료' });
  } catch (error) {
    console.error('[CONFIRM API ERROR]', error);
    return res
      .status(500)
      .json({ message: '트리거 실패', error: String(error) });
  }
}
