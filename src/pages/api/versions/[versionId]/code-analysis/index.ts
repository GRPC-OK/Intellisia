import type { NextApiRequest, NextApiResponse } from 'next';
import { handleSemgrepResult } from '@/services/code-analysis-service/handle-semgrep-result.service';

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

  const { status, fileUrl } = req.body;

  if (!status || !fileUrl) {
    return res.status(400).json({ message: 'Missing status or fileUrl' });
  }

  try {
    await handleSemgrepResult(versionId, status, fileUrl);
    return res.status(200).json({ message: '정적 분석 결과 저장 완료' });
  } catch (error) {
    console.error('[HANDLE SEMGREP RESULT ERROR]', error);
    return res
      .status(500)
      .json({ message: '분석 결과 저장 실패', error: String(error) });
  }
}
