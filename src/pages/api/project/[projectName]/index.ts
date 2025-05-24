import type { NextApiRequest, NextApiResponse } from 'next';
import { getProjectDetailByName } from '@/services/project.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectName } = req.query;

  if (typeof projectName !== 'string') {
    return res.status(400).json({ message: 'Invalid project name' });
  }

  try {
    const project = await getProjectDetailByName(projectName);
    if (!project) {
      return res.status(404).json({ message: 'Project Not Found' });
    }

    return res.status(200).json(project);
  } catch (err) {
    console.error('[GET /api/project/[projectName]]', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
