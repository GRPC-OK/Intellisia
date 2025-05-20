// pages/api/projects/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]'; // authOptions 경로 확인 필요
import prisma from '../../../lib/prisma'; // lib/prisma에서 prisma 인스턴스 가져오기

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
      techStack, // techStack의 타입이 Prisma 스키마와 일치하는지 확인 (예: string, string[], Json 등)
      cpu,        // 스키마에서 cpu가 Float? 또는 Int? 와 같이 선택적 필드인지 확인
      memory,     // 스키마에서 memory가 Float? 또는 Int? 와 같이 선택적 필드인지 확인
      applicationPort,
    } = req.body;

    // 필수 필드 검사
    if (!projectName || !gitRepoUrl || !subdomain || !techStack || !applicationPort) {
      return res.status(400).json({ message: 'Missing required fields: projectName, gitRepoUrl, subdomain, techStack, applicationPort' });
    }

    // applicationPort 유효성 검사
    if (typeof applicationPort !== 'number' || applicationPort <= 0 || applicationPort > 65535) {
      return res.status(400).json({ message: 'Application port must be a valid positive number between 1 and 65535.' });
    }

    // CPU 유효성 검사 (제공된 경우에만)
    if (cpu !== undefined && (typeof cpu !== 'number' || cpu <= 0)) {
      return res.status(400).json({ message: 'CPU must be a positive number if provided.' });
    }

    // Memory 유효성 검사 (제공된 경우에만)
    if (memory !== undefined && (typeof memory !== 'number' || memory <= 0)) {
      return res.status(400).json({ message: 'Memory must be a positive number if provided.' });
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
        description: description || null, // description이 없을 경우 null 처리
        githubUrl: gitRepoUrl,
        domain: subdomain,
        ownerId: user.id,
        techStack: techStack, // Prisma 스키마의 techStack 타입과 일치해야 함
        cpu: cpu,             // Prisma 스키마에서 cpu가 optional(Float? 또는 Int?)이면 undefined도 허용
        memory: memory,         // Prisma 스키마에서 memory가 optional(Float? 또는 Int?)이면 undefined도 허용
        applicationPort: applicationPort,
      },
    });

    return res.status(201).json({ projectId: newProject.id, message: 'Project created successfully' });

  } catch (error: unknown) {
    console.error('Error creating project:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // 유니크 제약 조건 위반 (P2002)
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        let isDomainError = false;

        // target이 문자열 배열 또는 문자열일 수 있음
        if (Array.isArray(target) && target.includes('domain')) {
          isDomainError = true;
        } else if (typeof target === 'string' && target.includes('domain')) {
          isDomainError = true;
        }
        // 다른 유니크 필드(예: 'name')에 대한 처리도 추가 가능
        // else if (Array.isArray(target) && target.includes('name')) { ... }


        if (isDomainError) {
          return res.status(400).json({ message: '이미 사용 중인 하위 도메인입니다.', errorField: 'subdomain', errorCode: error.code });
        }
        // 다른 유니크 제약 조건 위반에 대한 일반적인 메시지
        return res.status(400).json({ message: '이미 사용 중인 값이 있습니다. 입력값을 확인해주세요.', errorFields: target, errorCode: error.code });
      }
      // 다른 Prisma 클라이언트 요청 에러
      return res.status(500).json({ message: '데이터베이스 처리 중 오류가 발생했습니다.', errorDetail: error.message, errorCode: error.code });
    }

    // 일반적인 Error 객체
    if (error instanceof Error) {
      return res.status(500).json({ message: '프로젝트 생성 중 서버 오류가 발생했습니다.', errorDetail: error.message });
    }

    // 그 외 알 수 없는 에러
    return res.status(500).json({ message: '프로젝트 생성 중 알 수 없는 서버 오류가 발생했습니다.' });
  }
  // `finally { await prisma.$disconnect(); }` 블록은 전역 prisma 인스턴스 사용 시 제거합니다.
}