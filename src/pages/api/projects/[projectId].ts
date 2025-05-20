import type { NextApiRequest, NextApiResponse } from 'next';
import { getProjectDetail } from '@/services/project.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const projectId = Number(req.query.projectId);
  const sortQuery = req.query.sort === 'oldest' ? 'asc' : 'desc';

  if (req.method === 'GET') {
    try {
      const project = await getProjectDetail(projectId, sortQuery);
      if (!project) return res.status(404).json({ message: 'Not Found' });

      return res.status(200).json(project);
    } catch (error) {
      console.error('[API Error]', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
