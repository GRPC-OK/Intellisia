import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

interface Project {
  id: number;
  name: string;
}

interface ErrorResponse {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Project[] | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ message: 'Method not allowed' } as ErrorResponse);
  }

  try {
    const project = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return res.status(200).json(project);
  } catch (error) {
    console.error('Detailed error:', error);
    return res.status(500).json({
      message: '프로젝트 목록을 가져오는 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}
