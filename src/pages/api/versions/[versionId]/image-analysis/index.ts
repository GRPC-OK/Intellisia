// src/pages/api/versions/[versionId]/image-analysis/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const versionId = Number(req.query.versionId);

  console.log(`[API /image-analysis] Received versionId: ${req.query.versionId} (parsed as: ${versionId})`);
  if (isNaN(versionId)) {
    console.error(`[API /image-analysis] ERROR: Invalid versionId: ${req.query.versionId}. Returning 400.`);
    return res.status(400).json({ message: 'Invalid versionId provided in URL. It must be a number.' });
  }

  try {
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      select: {
        id: true,
        name: true,
        imageStatus: true,
        imageAnalysisS3Url: true,
        project: {
          select: {
            id: true,
            name: true,
            owner: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // 1. 버전이 DB에 없는 경우: 404 반환
    if (!version) {
      console.warn(`[API /image-analysis] Version with ID ${versionId} not found in DB. Returning 404.`);
      return res.status(404).json({ message: 'Version not found.' });
    }

    // 2. imageStatus가 'success'가 아닌 경우: 404 반환
    if (version.imageStatus !== 'success') {
      console.warn(`[API /image-analysis] Image analysis not successful for version ID ${versionId}. Status: ${version.imageStatus}. Returning 404.`);
      return res.status(404).json({ message: 'Image analysis not successful for this version.' });
    }

    // 3. imageAnalysisS3Url이 없는 경우: 404 반환
    if (!version.imageAnalysisS3Url) {
      console.warn(`[API /image-analysis] No imageAnalysisS3Url found for version ID ${versionId}. Returning 404.`);
      return res.status(404).json({ message: 'No analysis result found for this version (missing S3 URL).' });
    }

    // 4. S3에서 SARIF 파일 가져오기
    try {
      console.log(`[API /image-analysis] Attempting to fetch SARIF from: ${version.imageAnalysisS3Url}`);
      const sarifResponse = await fetch(version.imageAnalysisS3Url);

      if (!sarifResponse.ok) {
        const errorText = await sarifResponse.text();
        console.error(`[IMAGE ANALYSIS API ERROR] S3 fetch failed for ${version.imageAnalysisS3Url}: ${sarifResponse.status} ${errorText}`);
        return res.status(500).json({ message: 'Failed to fetch SARIF from S3.', error: errorText });
      }

      const sarifData = await sarifResponse.json();
      console.log(`[API /image-analysis] Successfully fetched SARIF for version ${versionId} from S3.`);

      // 5. 성공적인 응답 반환
      return res.status(200).json({
        version: {
          id: version.id,
          name: version.name,
          project: {
            id: version.project.id,
            name: version.project.name,
            ownerName: version.project.owner.name,
          },
        },
        sarifData,
        status: 'success',
        hasAnalysisResult: true,
      });
    } catch (s3FetchError) {
      console.error(`[API /image-analysis] S3 fetch/parse failed. Error: ${s3FetchError}`);
      return res.status(500).json({ message: 'Failed to fetch or parse SARIF from S3.', error: String(s3FetchError) });
    }

  } catch (error) {
    console.error('[IMAGE ANALYSIS API ERROR - CATCH BLOCK]', error);
    return res.status(500).json({
      message: 'Internal Server Error during SARIF fetching or processing.',
      error: String(error),
    });
  }
}
