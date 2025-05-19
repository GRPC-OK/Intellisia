// pages/api/projects/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]'; // NextAuth 설정 파일 경로 확인

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  // GitHub 이메일 기반 로그인이라고 하셨으므로 session.user.email을 사용
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized: User email not found in session' });
  }

  try {
    const {
      projectName,
      subdomain,
      description,
      gitRepoUrl,
      techStack,    // 템플릿 페이지에서 전달받는 값
      cpu,          // 템플릿 페이지에서 전달받는 값 (숫자)
      memory,       // 템플릿 페이지에서 전달받는 값 (숫자)
      networkConfig, // 템플릿 페이지에서 전달받는 값
    } = req.body;

    // 필수 값 검증 강화 (예시)
    if (!projectName || !gitRepoUrl || !subdomain) {
        return res.status(400).json({ message: 'Project name, Git repository URL, and subdomain are required.' });
    }
    // 숫자형 필드에 대한 추가 검증 (선택적)
    if (cpu && (isNaN(parseInt(cpu, 10)) || parseInt(cpu, 10) <= 0)) {
        return res.status(400).json({ message: 'CPU value must be a positive number.' });
    }
    if (memory && (isNaN(parseInt(memory, 10)) || parseInt(memory, 10) <= 0)) {
        return res.status(400).json({ message: 'Memory value must be a positive number.' });
    }


    const currentUserEmail = session.user.email;
    const user = await prisma.user.findUnique({
      where: { email: currentUserEmail },
    });

    if (!user) {
      // 이 경우는 NextAuth 세션의 이메일과 DB의 사용자 이메일이 동기화되지 않았을 가능성
      return res.status(404).json({ message: 'User not found in database.' });
    }

    const newProject = await prisma.project.create({
      data: {
        name: projectName,
        // description 필드가 Prisma 스키마에서 String? 이라면 || null, String이라면 빈 문자열 처리 필요
        description: description || null, // 스키마의 description 타입에 따라 조정
        githubUrl: gitRepoUrl,
        domain: subdomain,
        ownerId: user.id, // user.id는 Int, Project.ownerId도 Int이므로 OK

        // 새로 추가된 필드 저장
        techStack: techStack || null,
        // cpu와 memory는 CreateProjectPage에서 number 타입으로 관리되므로,
        // JSON.stringify를 거치면 숫자로 올 것입니다. 그래도 안전하게 parseInt 처리.
        // 값이 없거나 (0, null, undefined) 유효하지 않은 숫자면 null 저장
        cpu: cpu ? parseInt(String(cpu), 10) : null,
        memory: memory ? parseInt(String(memory), 10) : null,
        networkConfig: networkConfig || null,
      },
    });

    // newProject.id는 Int 타입입니다.
    return res.status(201).json({ projectId: newProject.id, message: 'Project created successfully' });

  } catch (error: any) {
    console.error('Error creating project:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('domain')) {
      return res.status(400).json({ message: '이미 사용 중인 하위 도메인입니다.' });
    }
    // 다른 Prisma 에러 코드에 대한 처리도 추가할 수 있습니다.
    return res.status(500).json({ message: '프로젝트 생성 중 서버 오류가 발생했습니다.', error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}