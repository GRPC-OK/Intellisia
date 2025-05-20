// pages/api/projects/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]'; // NextAuth 설정 파일 경로 확인

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
      applicationPort, // 이것만 남음
    } = req.body;

    // 필수 값 검증
    if (!projectName || !gitRepoUrl || !subdomain || !techStack || !applicationPort) {
        return res.status(400).json({ message: 'Missing required fields: projectName, gitRepoUrl, subdomain, techStack, applicationPort' });
    }
    if (typeof applicationPort !== 'number' || applicationPort <= 0 || applicationPort > 65535) {
        return res.status(400).json({ message: 'Application port must be a valid positive number between 1 and 65535.' });
    }
    // CPU, Memory 값도 숫자 및 범위 검증 필요
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
        techStack: techStack, // techStack은 필수라고 가정
        cpu: cpu, // 프론트에서 이미 숫자로 변환
        memory: memory, // 프론트에서 이미 숫자로 변환
        applicationPort: applicationPort, // 프론트에서 이미 숫자로 변환
      },
    });

    return res.status(201).json({ projectId: newProject.id, message: 'Project created successfully' });

  } catch (error: any) {
    console.error('Error creating project:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('domain')) {
      return res.status(400).json({ message: '이미 사용 중인 하위 도메인입니다.' });
    }
    return res.status(500).json({ message: '프로젝트 생성 중 서버 오류가 발생했습니다.', errorDetail: error.message }); // errorDetail 추가
  } finally {
    await prisma.$disconnect();
  }
}