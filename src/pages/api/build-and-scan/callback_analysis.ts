// src/pages/api/build-and-scan/callback_analysis.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, AnalysisStatus } from '@prisma/client'

// Prisma ORM 클라이언트 생성
const prisma = new PrismaClient()

// API 엔드포인트 핸들러
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // POST 메서드만 허용
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  // 요청 바디에서 status와 fileUrl 추출 (JSON 바디로 전달됨)
  const { status, fileUrl } = req.body

  // 쿼리스트링에서 versionId 추출
  const versionIdRaw = req.query.versionId
  const versionId = parseInt(versionIdRaw as string, 10)

  // 필수 파라미터 유효성 검증
  if (!versionId || !status || !fileUrl) {
    return res.status(400).json({ error: 'Missing parameters' })
  }

  try {
    // 워크플로우에서 받은 status를 Prisma Enum 값으로 변환
    // "success" → "passed_no_issues", 나머지는 전부 "failed"
    const enumStatus: AnalysisStatus =
      status === 'success' ? 'passed_no_issues' : 'failed'

    // versionId로 해당 코드 분석 데이터 업데이트
    await prisma.codeAnalysis.update({
      where: { versionId },  // versionId는 고유한 키 (Prisma에서 unique constraint 걸려있음)
      data: {
        status: enumStatus,  // 분석 상태 업데이트
        sarifUrl: fileUrl,   // S3 업로드된 .sarif 파일 URL 저장
      },
    })

    // 클라이언트로 성공 응답 반환
    res.status(200).json({ message: `Analysis result updated for versionId ${versionId}` })
  } catch (err) {
    // 에러 발생 시 서버 에러 응답
    console.error('[callback_analysis.ts] DB update error:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
