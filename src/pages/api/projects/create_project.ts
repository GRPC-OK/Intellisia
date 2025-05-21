import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
// import { getSession } from 'next-auth/react';

interface CreateProjectRequest {
  projectName: string;
  description: string;
  githubUrl: string;
  domain: string;
  defaultHelmValues: {
    replicaCount: number;
    service: {
      targetPort: number;
    };
  };
}

interface ErrorResponse {
  message: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ id: number; name: string } | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ message: 'Method not allowed' } as ErrorResponse);
  }

  try {
    // TODO: 인증 관련 코드는 나중에 구현
    // const session = await getSession({ req });
    // if (!session?.user?.email) {
    //   return res.status(401).json({ message: '인증이 필요합니다.' });
    // }

    // const user = await prisma.user.findUnique({
    //   where: { email: session.user.email },
    // });

    // if (!user) {
    //   return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    // }

    const { projectName, description, githubUrl, domain, defaultHelmValues } =
      req.body as CreateProjectRequest;

    // 기본값 설정
    const defaultValues = {
      ...defaultHelmValues,
      service: {
        port: 80,
        type: 'ClusterIP',
        ...defaultHelmValues.service,
      },
      resources: {
        limits: {
          cpu: '500m',
          memory: '512Mi',
        },
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
      },
    };

    const project = await prisma.project.create({
      data: {
        name: projectName,
        description: description || '',
        githubUrl,
        domain,
        defaultHelmValues: defaultValues,
        ownerId: 1, // 테스트용 하드코딩된 ownerId
      },
    });

    return res.status(201).json({
      id: project.id,
      name: project.name,
    });
  } catch (error) {
    console.error('프로젝트 생성 중 오류 발생:', error);
    return res.status(500).json({
      message: '프로젝트 생성 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ErrorResponse);
  }
}
