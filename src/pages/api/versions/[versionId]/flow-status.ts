import type { NextApiRequest, NextApiResponse } from 'next';
import { getVersionFlowStatus } from '@/services/version.service';

/*
    [GET] /api/versions/[versionId]/flow-status
    - 특정 버전의 5단계 상태 + 전체 진행 상태를 반환
    - 잘못된 versionId -> 400
    - 존재하지 않는 versionId -> 404
    - 내부 에러 -> 500 (추후 에러 리팩토링 예정)
*/

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const versionId = Number(req.query.versionId);

  if (isNaN(versionId)) {
    return res.status(400).json({ message: 'Invalid versionid' });
  }

  if (req.method != 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const data = await getVersionFlowStatus(versionId);
    if (!data) return res.status(404).json({ message: 'Version not found' });

    return res.status(200).json(data);
  } catch (error) {
    console.error('[GET_FLOW_STATUS_ERROR]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
