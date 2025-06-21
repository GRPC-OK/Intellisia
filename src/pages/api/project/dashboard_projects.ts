// src/pages/api/project/dashboard_projects.ts - 인증 적용 버전
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { authenticateUser, getUserIdFromRequest } from '@/middleware/auth.middleware';

interface AuthenticatedProject {
  id: number;
  name: string;
  owner?: {
    id: number;
    name: string;
  };
  isOwner: boolean;
}

interface ErrorResponse {
  message: string;
  code?: string;
}

/**
 * 인증된 사용자의 프로젝트 목록을 가져오는 핸들러
 * - 사용자가 소유한 프로젝트
 * - 사용자가 기여자로 참여한 프로젝트
 */
async function getDashboardProjectsHandler(
  req: NextApiRequest,
  res: NextApiResponse<AuthenticatedProject[] | ErrorResponse>
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({
        message: '인증되지 않은 사용자입니다.',
        code: 'UNAUTHENTICATED'
      });
    }

    console.log(`[Dashboard API] Fetching projects for user ID: ${userId}`);

    // 사용자가 소유하거나 기여자로 참여한 프로젝트 조회
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          // 소유한 프로젝트
          { ownerId: userId },
          // 기여자로 참여한 프로젝트
          {
            contributors: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          }
        },
        contributors: {
          where: {
            userId: userId
          },
          select: {
            userId: true
          }
        }
      },
      orderBy: [
        // 소유한 프로젝트를 먼저 정렬
        { ownerId: 'desc' },
        // 그 다음 최근 생성순
        { createdAt: 'desc' }
      ]
    });

    // 응답 데이터 변환
    const transformedProjects: AuthenticatedProject[] = projects.map(project => ({
      id: project.id,
      name: project.name,
      owner: project.owner ? {
        id: project.owner.id,
        name: project.owner.name
      } : undefined,
      isOwner: project.ownerId === userId, // 현재 사용자가 소유자인지 확인
    }));

    console.log(`[Dashboard API] Found ${transformedProjects.length} projects for user ${userId}`);

    return res.status(200).json(transformedProjects);

  } catch (error) {
    console.error('[Dashboard API Error]', error);
    return res.status(500).json({
      message: '프로젝트 목록을 가져오는 중 오류가 발생했습니다.',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * 메인 핸들러 - 인증 미들웨어 적용
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthenticatedProject[] | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      message: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  // 인증 미들웨어 적용
  await authenticateUser(req, res, async () => {
    await getDashboardProjectsHandler(req, res);
  });
}