import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const versionId = Number(req.query.versionId);
  if (isNaN(versionId)) return res.status(400).send('Invalid versionId');

  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  try {
    const result = await prisma.codeAnalysis.findUnique({
      where: { versionId },
      select: { errorLogUrl: true },
    });

    if (!result?.errorLogUrl) {
      return res.status(404).send('Error log URL 없음');
    }

    const s3Res = await fetch(result.errorLogUrl);
    if (!s3Res.ok) throw new Error('에러 로그 요청 실패');
    const text = await s3Res.text();

    return res.status(200).send(text);
  } catch (err) {
    console.error('[GET_LOG_ERROR]', err);
    return res.status(500).send('로그 반환 실패');
  }
}
