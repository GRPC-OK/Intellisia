import type { NextApiRequest, NextApiResponse } from 'next';
import { getVersionWithProject } from '@/repositories/version.repository';
import { toVersionHeaderDto } from '@/dtos/versions/toVersionHeaderDto';
import { VersionWithProjectAndAuthor } from '@/types/version';

// 버전 이름 + 버전 id 가져오는 api
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const versionId = Number(req.query.versionId);
  if (isNaN(versionId)) {
    return res.status(400).json({ message: 'Invalid versionId' });
  }

  try {
    const version = await getVersionWithProject(versionId);
    if (!version) return res.status(404).json({ message: 'Version not found' });

    const dto = toVersionHeaderDto(version as VersionWithProjectAndAuthor);
    return res.status(200).json(dto);
  } catch (error) {
    console.error('[GET /api/versions/:versionId]', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
