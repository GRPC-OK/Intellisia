import type { NextApiRequest, NextApiResponse } from 'next';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';
import { triggerDeploymentWorkflow } from '@/services/deployment-service/trigger-deployment-workflow';
import prisma from '@/lib/prisma';

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
      // 거부된 경우: 기존 로직 유지
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

    // 🆕 승인된 경우: 배포까지 자동 실행

    // 1. 버전 정보 조회 (배포에 필요한 데이터)
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      include: {
        project: true,
        helmValues: true,
      },
    });

    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    // 2. 승인 상태 업데이트
    await updateVersionStatusSafely(versionId, {
      approveStatus: 'approved',
      deployStatus: 'pending', // 🆕 배포 상태도 함께 업데이트
      flowStatus: 'pending',
    });

    // 3. 🆕 자동으로 배포 워크플로우 트리거
    await triggerDeploymentWorkflow({
      versionId,
      projectName: version.project.name,
      imageTag: version.imageTag,
      domain: version.project.domain,
      helmValues: version.helmValues?.content,
    });

    return res.status(200).json({
      message: '버전이 승인되었고 배포가 시작되었습니다',
      versionId,
      status: 'approved_and_deploying', // 🆕 새로운 상태
    });
  } catch (error) {
    console.error('[APPROVAL AND DEPLOY ERROR]', error);

    // 에러 발생 시 상태 롤백
    await updateVersionStatusSafely(versionId, {
      approveStatus: 'pending', // 승인 상태 되돌리기
      deployStatus: 'fail',
      flowStatus: 'fail',
    });

    return res.status(500).json({
      message: '승인 및 배포 처리 실패',
      error: String(error),
    });
  }
}
