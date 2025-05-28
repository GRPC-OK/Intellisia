// src/pages/api/versions/[versionId]/deploy.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { triggerDeploymentWorkflow } from '@/services/deployment-service/trigger-deployment-workflow';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const versionId = Number(req.query.versionId);
  if (isNaN(versionId)) {
    return res.status(400).json({ message: 'Invalid versionId' });
  }

  try {
    // 1. 버전 정보 조회
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

    // 2. 승인 상태 확인
    if (version.approveStatus !== 'approved') {
      return res.status(400).json({ message: '승인되지 않은 버전은 배포할 수 없습니다' });
    }

    // 3. 배포 상태를 pending으로 업데이트
    await updateVersionStatusSafely(versionId, {
      deployStatus: 'pending',
    });

    // 4. 배포 워크플로우 트리거
    await triggerDeploymentWorkflow({
      versionId,
      projectName: version.project.name,
      imageTag: version.imageTag,
      domain: version.project.domain,
      helmValues: version.helmValues?.content,
    });

    return res.status(200).json({ 
      message: '배포가 시작되었습니다',
      versionId,
      status: 'pending'
    });

  } catch (error) {
    console.error('[DEPLOYMENT ERROR]', error);
    
    // 에러 발생 시 배포 상태를 실패로 업데이트
    await updateVersionStatusSafely(versionId, {
      deployStatus: 'fail',
      flowStatus: 'fail',
    });

    return res.status(500).json({
      message: '배포 실행 실패',
      error: String(error),
    });
  }
}