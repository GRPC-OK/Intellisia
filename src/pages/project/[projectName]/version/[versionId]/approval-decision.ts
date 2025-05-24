import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // TODO: 실제 승인 처리 로직 작성 예정
  return res.status(200).json({ message: 'Approval decision received (stub)' });
}
