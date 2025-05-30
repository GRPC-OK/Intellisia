import type { NextApiRequest, NextApiResponse } from 'next';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { versionId, status } = req.query;

  if (!versionId || !status) {
    return res.status(400).json({ message: 'Missing versionId or status' });
  }

  const versionIdNum = Number(versionId);
  if (isNaN(versionIdNum)) {
    return res.status(400).json({ message: 'Invalid versionId' });
  }

  if (!['success', 'fail'].includes(status as string)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const deployStatus = status === 'success' ? 'success' : 'fail';
    const flowStatus = status === 'success' ? 'success' : 'fail';

    await updateVersionStatusSafely(versionIdNum, {
      deployStatus,
      flowStatus,
    });

    console.log(
      `[DEPLOYMENT CALLBACK] versionId=${versionId}, status=${status}`
    );

    return res.status(200).json({
      message: '배포 결과가 성공적으로 업데이트되었습니다',
      versionId: versionIdNum,
      status: deployStatus,
    });
  } catch (error) {
    console.error('[DEPLOYMENT CALLBACK ERROR]', error);
    return res.status(500).json({
      message: '배포 결과 업데이트 실패',
      error: String(error),
    });
  }
}
