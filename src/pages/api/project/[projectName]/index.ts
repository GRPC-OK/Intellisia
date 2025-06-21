// src/pages/api/project/[projectName]/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { toProjectDetailDto } from '@/dtos/project/toProjectDetailDto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectName } = req.query;

  if (typeof projectName !== 'string') {
    return res.status(400).json({ message: 'Invalid project name' });
  }

  try {
    // ✅ owner와 contributors 관계를 포함하여 조회
    const project = await prisma.project.findUnique({
      where: { name: projectName },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          }
        },
        contributors: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              }
            }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project Not Found' });
    }

    // ✅ owner가 null인 경우 처리 (데이터 정합성 문제 대응)
    if (!project.owner) {
      console.warn(`[Project API] Project ${projectName} has no owner (ownerId: ${project.ownerId})`);

      // 기본 소유자 정보 생성 또는 에러 처리
      return res.status(500).json({
        message: 'Project owner information is missing',
        code: 'MISSING_OWNER',
        debug: {
          projectId: project.id,
          ownerId: project.ownerId,
          suggestion: 'Contact administrator to fix project ownership'
        }
      });
    }

    const projectDetail = toProjectDetailDto(project);
    return res.status(200).json(projectDetail);

  } catch (err) {
    console.error('[GET /api/project/[projectName]]', err);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? String(err) : undefined
    });
  }
}