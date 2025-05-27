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
      select: { sarifUrl: true },
    });

    if (!result?.sarifUrl) {
      return res.status(404).json({ message: 'SARIF URL 없음' });
    }

    const s3Res = await fetch(result.sarifUrl);
    if (!s3Res.ok) throw new Error('SARIF 파일 요청 실패');
    const json = await s3Res.json();

    return res.status(200).json(json);
  } catch (err) {
    console.error('[GET_SARIF_ERROR]', err);
    return res.status(500).json({ message: 'SARIF 반환 실패' });
  }
}
