// pages/api/projects/dashboard_projects.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        // TODO: 필요한 필드를 추가
      },
      orderBy: {
        id: 'desc',
      },
    });

    return res.status(200).json(projects);
  } catch (error) {
    console.error('Detailed error:', error);
    return res.status(500).json({
      message: '프로젝트 목록을 가져오는 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
