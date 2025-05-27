import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const versionId = Number(req.query.versionId);
  if (isNaN(versionId))
    return res.status(400).json({ message: 'Invalid versionId' });

  if (req.method !== 'GET')
    return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const result = await prisma.codeAnalysis.findUnique({
      where: { versionId },
      select: { status: true },
    });
    if (!result) return res.status(404).json({ message: '분석 결과 없음' });

    return res.status(200).json({ status: result.status });
  } catch (err) {
    console.error('[GET_ANALYSIS_STATUS_ERROR]', err);
    return res.status(500).json({ message: '서버 오류' });
  }
}
