// src/pages/api/versions/[versionId]/approval-decision.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const versionId = Number(req.query.versionId);
  if (isNaN(versionId)) {
    return res.status(400).json({ message: 'Invalid versionId' });
  }

  const { approved } = req.body;
  if (typeof approved !== 'boolean') {
    return res.status(400).json({ message: 'approved must be a boolean' });
  }

  try {
    const approveStatus = approved ? 'approved' : 'rejected';
    const flowStatus = approved ? 'pending' : 'fail'; // 승인되면 배포, 거부되면 실패

    await updateVersionStatusSafely(versionId, {
      approveStatus,
      flowStatus,
    });

    return res.status(200).json({
      message: `버전이 ${approved ? '승인' : '거부'}되었습니다`,
      versionId,
      status: approveStatus,
    });

  } catch (error) {
    console.error('[APPROVAL DECISION ERROR]', error);
    return res.status(500).json({
      message: '승인 결정 처리 실패',
      error: String(error),
    });
  }
}