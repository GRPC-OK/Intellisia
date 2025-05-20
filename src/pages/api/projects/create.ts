// pages/api/projects/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client'; // Prisma 타입 임포트
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized: User email not found in session' });
  }

  try {
    const {
      projectName,
      subdomain,
      description,
      gitRepoUrl,
      techStack,
      cpu,
      memory,
      applicationPort,
    } = req.body;

    if (!projectName || !gitRepoUrl || !subdomain || !techStack || !applicationPort) {
        return res.status(400).json({ message: 'Missing required fields: projectName, gitRepoUrl, subdomain, techStack, applicationPort' });
    }
    if (typeof applicationPort !== 'number' || applicationPort <= 0 || applicationPort > 65535) {
        return res.status(400).json({ message: 'Application port must be a valid positive number between 1 and 65535.' });
    }
    if (typeof cpu !== 'number' || cpu <= 0) {
        return res.status(400).json({ message: 'CPU must be a positive number.' });
    }
    if (typeof memory !== 'number' || memory <= 0) {
        return res.status(400).json({ message: 'Memory must be a positive number.' });
    }

    const currentUserEmail = session.user.email;
    const user = await prisma.user.findUnique({
      where: { email: currentUserEmail },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found in database.' });
    }

    const newProject = await prisma.project.create({
      data: {
        name: projectName,
        description: description || null,
        githubUrl: gitRepoUrl,
        domain: subdomain,
        ownerId: user.id,
        techStack: techStack,
        cpu: cpu,
        memory: memory,
        applicationPort: applicationPort,
      },
    });

    return res.status(201).json({ projectId: newProject.id, message: 'Project created successfully' });

  } catch (error: unknown) { // error 타입을 unknown으로 변경
    console.error('Error creating project:', error);

    // Prisma 고유 에러 코드(P2002: 유니크 제약 조건 위반)인지 확인
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // error.meta.target이 string[] 또는 string일 수 있으므로 확인
        const target = error.meta?.target;
        let isDomainError = false;
        if (typeof target === 'string' && target.includes('domain')) {
            isDomainError = true;
        } else if (Array.isArray(target) && target.includes('domain')) {
            isDomainError = true;
        }

        if (isDomainError) {
          return res.status(400).json({ message: '이미 사용 중인 하위 도메인입니다.', errorDetail: error.message });
        }
      }
      // 다른 Prisma 에러의 경우
      return res.status(500).json({ message: '데이터베이스 처리 중 오류가 발생했습니다.', errorDetail: error.message });
    }

    // 일반적인 Error 객체인지 확인
    if (error instanceof Error) {
      return res.status(500).json({ message: '프로젝트 생성 중 서버 오류가 발생했습니다.', errorDetail: error.message });
    }

    // 그 외 알 수 없는 에러
    return res.status(500).json({ message: '프로젝트 생성 중 알 수 없는 서버 오류가 발생했습니다.' });
  } finally {
    await prisma.$disconnect();
  }
}