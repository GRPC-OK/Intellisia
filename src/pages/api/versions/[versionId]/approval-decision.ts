import type { NextApiRequest, NextApiResponse } from 'next';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';
import { triggerDeploymentAfterApproval } from '@/application/trigger-deployment-after-approval';

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
    if (!approved) {
      // 거부된 경우 처리
      await updateVersionStatusSafely(versionId, {
        approveStatus: 'rejected',
        flowStatus: 'fail',
      });

      return res.status(200).json({
        message: '버전이 거부되었습니다',
        versionId,
        status: 'rejected',
      });
    }

    // 승인 상태만 반영
    await updateVersionStatusSafely(versionId, {
      approveStatus: 'approved',
    });

    // 배포는 triggerDeploymentAfterApproval 함수에 위임
    try {
      await triggerDeploymentAfterApproval(versionId);

      return res.status(200).json({
        message: '버전이 승인되었고 배포가 시작되었습니다',
        versionId,
        status: 'approved_and_deploying',
      });
    } catch (deployErr) {
      console.error('[DEPLOY ERROR]', deployErr);
      return res.status(500).json({
        message: '배포 실패 (승인 상태는 유지됨)',
        error: String(deployErr),
      });
    }
  } catch (err) {
    console.error('[APPROVAL ERROR]', err);
    return res.status(500).json({
      message: '승인 처리 실패',
      error: String(err),
    });
  }
}
