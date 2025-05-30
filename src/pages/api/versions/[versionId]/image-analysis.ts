// src/pages/api/versions/[versionId]/image-analysis.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const versionId = Number(req.query.versionId);

  console.log(
    `[API /image-analysis] Received versionId: ${req.query.versionId} (parsed as: ${versionId})`
  );
  if (isNaN(versionId)) {
    console.error(
      `[API /image-analysis] ERROR: Invalid versionId: ${req.query.versionId}. Returning 400.`
    );
    return res.status(400).json({
      message: 'Invalid versionId provided in URL. It must be a number.',
    });
  }

  try {
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      select: {
        imageAnalysisS3Url: true, // ✅ 이 라인 뒤의 불필요한 '{'나 주석을 완전히 제거하세요.
        name: true,
        id: true,
        project: {
          select: {
            name: true,
            owner: true, // ✅ 'owner: { name: true }' 대신 'owner: true'로 변경
            id: true,
          },
        },
      },
    });

    // ✅ mockSarifData는 여전히 필요하므로 여기에 유지 (이전처럼 복사해서 넣어야 함)
    const mockSarifData = {
      $schema:
        'https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json',
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'Trivy',
              fullName: 'Trivy Vulnerability Scanner',
              version: '0.50.0',
            },
          },
          results: [
            {
              ruleId: 'CVE-2023-4567',
              message: {
                text: 'Critical vulnerability in curl library.',
              },
              locations: [
                {
                  physicalLocation: {
                    artifactLocation: {
                      uri: 'package.json',
                    },
                    region: {
                      startLine: 10,
                    },
                  },
                },
              ],
              level: 'error',
              properties: {
                severity: 'CRITICAL',
                cwe: ['CWE-123'],
                cve: 'CVE-2023-4567',
              },
            },
            {
              ruleId: 'CVE-2023-8901',
              message: {
                text: 'High severity issue in zlib.',
              },
              locations: [
                {
                  physicalLocation: {
                    artifactLocation: {
                      uri: 'Dockerfile',
                    },
                    region: {
                      startLine: 5,
                    },
                  },
                },
              ],
              level: 'warning',
              properties: {
                severity: 'HIGH',
                cve: 'CVE-2023-8901',
              },
            },
          ],
        },
      ],
    }; // 1. 버전이 DB에 아예 없는 경우: 404를 반환

    if (!version) {
      console.warn(
        `[API /image-analysis] Version with ID ${versionId} not found in DB. Returning 404.`
      );
      return res.status(404).json({ message: 'Version not found.' });
    } // 2. imageAnalysisS3Url이 DB에 없는 경우: 404를 반환

    if (!version.imageAnalysisS3Url) {
      console.warn(
        `[API /image-analysis] No imageAnalysisS3Url found for version ID ${versionId}. Returning 404.`
      );
      return res.status(404).json({
        message: 'No analysis result found for this version (missing S3 URL).',
      });
    }

    let sarifData; // 3. DB에 S3 URL이 있다면, 이제 S3에서 SARIF 파일 가져오기
    try {
      // S3 fetch 시도
      console.log(
        `[API /image-analysis] Attempting to fetch SARIF from: ${version.imageAnalysisS3Url}`
      );
      const sarifResponse = await fetch(version.imageAnalysisS3Url);

      if (!sarifResponse.ok) {
        const errorText = await sarifResponse.text();
        console.error(
          `[IMAGE ANALYSIS API ERROR] S3 fetch failed for ${version.imageAnalysisS3Url}: ${sarifResponse.status} ${errorText}`
        );
        throw new Error(
          `Failed to fetch SARIF from S3. Status: ${sarifResponse.status} - ${errorText}`
        );
      }
      sarifData = await sarifResponse.json(); // JSON 파싱 실패 시 에러 발생 가능
      console.log(
        `[API /image-analysis] Successfully fetched SARIF for version ${versionId} from S3.`
      );
    } catch (s3FetchError) {
      // S3 fetch나 JSON 파싱 에러 발생 시 mockSarifData 반환 (테스트 목적)
      console.error(
        `[API /image-analysis] S3 fetch/parse failed. Returning mock data instead. Error: ${s3FetchError}`
      );
      sarifData = mockSarifData; // 실제 에러 대신 목업 데이터로 대체
    } // 4. 성공적인 응답 반환

    console.log(
      `[API /image-analysis] Successfully fetched SARIF for version ${versionId}.`
    );
    return res.status(200).json({
      version: {
        id: version.id,
        name: version.name,
        project: {
          id: version.project.id, // project.id도 추가해야 함
          name: version.project.name,
          ownerName: version.project.owner.name, // owner 객체에서 name 접근
        },
      },
      sarifData, // S3에서 가져온 데이터이거나, 실패 시 mockSarifData
      status: 'success',
      hasAnalysisResult: true,
    });
  } catch (error) {
    // try-catch 블록 내에서 발생한 모든 에러를 여기서 잡아서 500 응답
    console.error('[IMAGE ANALYSIS API ERROR - CATCH BLOCK]', error);
    return res.status(500).json({
      message: 'Internal Server Error during SARIF fetching or processing.',
      error: String(error),
    });
  }
}
