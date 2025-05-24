import type { NextApiRequest, NextApiResponse } from 'next';
import { getVersionsByProject } from '@/repositories/version.repository';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const projectId = Number(req.query.projectId);
  const sort = req.query.sort === 'oldest' ? 'asc' : 'desc';

  if (!projectId || isNaN(projectId)) {
    return res.status(400).json({ message: 'Invalid projectId' });
  }

  try {
    const versions = await getVersionsByProject(projectId, sort);
    res.status(200).json(versions);
  } catch (error) {
    console.error('[GET /api/versions]', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
