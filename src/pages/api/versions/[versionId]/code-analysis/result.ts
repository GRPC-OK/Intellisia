import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const versionId = Number(req.query.versionId);
  if (isNaN(versionId)) {
    return res.status(400).json({ message: 'Invalid versionId' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const result = await prisma.codeAnalysis.findUnique({
      where: { versionId },
      select: { status: true, sarifUrl: true, errorLogUrl: true },
    });

    if (!result) {
      return res.status(404).json({ message: '분석 결과 없음' });
    }

    let status = result.status as
      | 'failed'
      | 'passed_with_issues'
      | 'passed_no_issues'
      | 'pending'
      | 'none';
    let sarif: object | undefined = undefined;
    let logText: string | undefined = undefined;

    if (result.sarifUrl) {
      const sarifRes = await fetch(result.sarifUrl);
      if (sarifRes.ok) {
        const sarifJson = await sarifRes.json();
        const hasIssues =
          Array.isArray(sarifJson?.runs) && sarifJson.runs.length > 0;

        status = hasIssues ? 'passed_with_issues' : 'passed_no_issues';
        if (hasIssues) sarif = sarifJson;
      }
    }

    if (result.errorLogUrl) {
      const logRes = await fetch(result.errorLogUrl);
      if (logRes.ok) {
        logText = await logRes.text();
      }
    }

    return res.status(200).json({ status, sarif, logText });
  } catch (err) {
    console.error('[GET_CODE_ANALYSIS_ERROR]', err);
    return res.status(500).json({ message: '서버 오류' });
  }
}
