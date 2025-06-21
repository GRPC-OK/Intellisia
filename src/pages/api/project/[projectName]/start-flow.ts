// src/pages/api/project/[projectName]/start-flow.ts - 중복 제거된 버전
import type { NextApiRequest, NextApiResponse } from 'next';
import { startFullFlow } from '@/application/start-full-flow';
import { authenticateUser, getUserIdFromRequest } from '@/middleware/auth.middleware';
import prisma from '@/lib/prisma';
import type { CreateVersionParams } from '@/services/version-service/initiate-version.service';

async function startFlowHandler(req: NextApiRequest, res: NextApiResponse) {
  const { projectName } = req.query as { projectName?: string };

  if (!projectName) {
    return res.status(400).json({
      message: 'Missing projectName',
      code: 'MISSING_PROJECT_NAME'
    });
  }

  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({
        message: '인증이 필요합니다.',
        code: 'UNAUTHENTICATED'
      });
    }

    // 프로젝트 존재 여부 및 권한 확인
    const project = await prisma.project.findUnique({
      where: { name: projectName },
      include: {
        contributors: {
          where: { userId },
          select: { userId: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        message: '프로젝트를 찾을 수 없습니다.',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    // 권한 확인: 소유자이거나 기여자여야 함
    const isOwner = project.ownerId === userId;
    const isContributor = project.contributors.length > 0;

    if (!isOwner && !isContributor) {
      return res.status(403).json({
        message: '이 프로젝트에 대한 권한이 없습니다.',
        code: 'FORBIDDEN'
      });
    }

    const { branch, helmValueOverrides } = req.body as CreateVersionParams;

    if (!branch) {
      return res.status(400).json({
        message: 'branch는 필수입니다.',
        code: 'MISSING_BRANCH'
      });
    }

    console.log(`[Start Flow] User ${userId} starting flow for project ${projectName}, branch: ${branch}`);

    const version = await startFullFlow(projectName, {
      branch,
      helmValueOverrides,
    });

    return res.status(200).json({
      message: '버전 생성 및 정적 분석 트리거 완료',
      versionId: version.id,
      versionName: version.name,
    });

  } catch (error) {
    console.error('[START FLOW ERROR]', error);
    return res.status(500).json({
      message: '전체 흐름 실패',
      error: String(error),
      code: 'INTERNAL_ERROR'
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method Not Allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  await authenticateUser(req, res, async () => {
    await startFlowHandler(req, res);
  });
}