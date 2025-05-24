import type { NextApiRequest, NextApiResponse } from 'next';
import { startCodeAnalysis } from '@/application/code-analysis/start-code-analysis';

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
    await startCodeAnalysis(versionId);
    return res.status(200).json({ message: '정적 분석 트리거 완료' });
  } catch (error) {
    console.error('[CONFIRM API ERROR]', error);
    return res.status(500).json({
      message: '트리거 실패',
      error: String(error),
    });
  }
}
