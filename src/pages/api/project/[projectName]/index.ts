import type { NextApiRequest, NextApiResponse } from 'next';
import { getProjectByName } from '@/repositories/project.repository';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectName } = req.query;

  if (typeof projectName !== 'string') {
    return res.status(400).json({ message: 'Invalid project name' });
  }

  try {
    const project = await getProjectByName(projectName);
    if (!project) return res.status(404).json({ message: 'Project Not Found' });
    res.status(200).json(project); // versions 없음
  } catch (err) {
    console.error('[GET /api/project/[projectName]]', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
