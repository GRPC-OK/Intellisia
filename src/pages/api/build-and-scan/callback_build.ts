// src/pages/api/build-and-scan/callback_analysis.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, AnalysisStatus } from '@prisma/client'

// Prisma ORM 클라이언트 생성 (DB 접근용)
const prisma = new PrismaClient()

// API 엔드포인트 핸들러 함수 (Next.js API Route)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. 요청 메서드 확인: POST만 허용
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  // 2. 요청 바디에서 status(분석 상태), fileUrl(S3 파일 URL) 추출
  // GitHub Actions 워크플로우에서 JSON 바디로 전달됨 (curl -d '{"status": "...", "fileUrl": "..."}')
  const { status, fileUrl } = req.body

  // 3. 쿼리스트링에서 versionId 추출 (e.g., /callback_analysis?versionId=2)
  const versionIdRaw = req.query.versionId
  const versionId = parseInt(versionIdRaw as string, 10)

  // 4. 필수 파라미터 유효성 검사 (모두 있어야 진행)
  if (!versionId || !status || !fileUrl) {
    return res.status(400).json({ error: 'Missing parameters' })
  }

  try {
    // 5. status 값 변환 (워크플로우에서 전달된 값 → Prisma Enum 값)
    //    - "success" → "passed_no_issues" (분석 성공, 문제 없음)
    //    - 그 외 값 (fail) → "failed" (분석 실패)
    const enumStatus: AnalysisStatus =
      status === 'success' ? 'passed_no_issues' : 'failed'

    // 6. Prisma ORM으로 DB의 codeAnalysis 테이블 업데이트
    //    - versionId로 해당 코드 분석 데이터 찾고
    //    - status와 sarifUrl 값 업데이트
    await prisma.codeAnalysis.update({
      where: { versionId },  // versionId는 Prisma에서 unique constraint로 설정됨
      data: {
        status: enumStatus,  // 분석 상태 업데이트 (passed_no_issues / failed)
        sarifUrl: fileUrl,   // S3에 저장된 .sarif 파일의 URL 저장
      },
    })

    // 7. 성공 응답 반환
    res.status(200).json({ message: `Analysis result updated for versionId ${versionId}` })
  } catch (err) {
    // 8. 에러 처리: DB 업데이트 실패 시 500 에러 반환
    console.error('[callback_analysis.ts] DB update error:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
