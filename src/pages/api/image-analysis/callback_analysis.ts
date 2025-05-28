// src/pages/api/image-analysis/callback_analysis.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { status, fileUrl } = req.body;

    if (!status || !fileUrl) {
      return res.status(400).json({ 
        message: 'Missing required fields: status, fileUrl' 
      });
    }

    // URL에서 versionId 추출 (예: version-123/trivy-results.sarif)
    const versionIdMatch = fileUrl.match(/version-(\d+)\//);
    if (!versionIdMatch) {
      return res.status(400).json({ 
        message: 'Cannot extract versionId from fileUrl' 
      });
    }

    const versionId = parseInt(versionIdMatch[1], 10);
    if (isNaN(versionId)) {
      return res.status(400).json({ 
        message: 'Invalid versionId extracted from fileUrl' 
      });
    }

    const isSuccess = status === 'success';

    // 버전 업데이트: imageAnalysisS3Url과 imageStatus 동시 업데이트
    if (isSuccess) {
      await prisma.version.update({
        where: { id: versionId },
        data: {
          imageAnalysisS3Url: fileUrl,
          imageStatus: 'success',
        },
      });

      // 버전 상태 업데이트 (승인 상태 자동 변경 포함)
      await updateVersionStatusSafely(versionId, {
        imageStatus: 'success',
      });

      console.log(`[SUCCESS] Image analysis completed for version ${versionId}: ${fileUrl}`);
    } else {
      await prisma.version.update({
        where: { id: versionId },
        data: {
          imageAnalysisS3Url: fileUrl, // 실패한 경우 에러 로그 URL
          imageStatus: 'fail',
        },
      });

      await updateVersionStatusSafely(versionId, {
        imageStatus: 'fail',
        flowStatus: 'fail',
      });

      console.log(`[FAIL] Image analysis failed for version ${versionId}: ${fileUrl}`);
    }

    return res.status(200).json({ 
      message: 'Image analysis callback processed successfully',
      versionId,
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