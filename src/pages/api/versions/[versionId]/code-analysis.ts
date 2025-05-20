import type { NextApiRequest, NextApiResponse } from 'next';
import { handleSemgrepResult } from '@/services/code-analysis-service/code-analysis.service';
import type { SarifCodeIssue } from '@/types/sarif';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '3mb',
    },
  },
};

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
    const contentType = req.headers['content-type'] ?? '';
    const issues = req.body as SarifCodeIssue[];
    await handleSemgrepResult(versionId, issues, contentType);

    return res.status(200).json({ message: '분석 결과 저장 완료' });
  } catch (error) {
    console.error('[CODE ANALYSIS ERROR]', error);
    return res.status(500).json({
      message: '분석 결과 저장 실패',
      error: String(error),
    });
  }
}
