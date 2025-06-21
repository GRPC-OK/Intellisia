import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { authenticateUser, getUserIdFromRequest } from '@/middleware/auth.middleware';
import {
  findProjectByDomainFromDB,
  createProjectInDB,
} from '@/services/db-access-service/project.db.service';

// 요청 본문 유효성 검사를 위한 Zod 스키마 정의
const projectCreateSchema = z.object({
  projectName: z.string().min(1, { message: '프로젝트 이름은 필수입니다.' }),
  description: z.string().optional(),
  githubUrl: z
    .string()
    .url({ message: '올바른 GitHub URL 형식이 아닙니다.' })
    .regex(/\.git$/, { message: 'GitHub URL은 .git으로 끝나야 합니다.' }),
  derivedDomain: z
    .string()
    .min(1, { message: '도메인 이름은 필수입니다.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        '도메인은 소문자 영숫자와 하이픈(-)만 사용 가능하며, 하이픈으로 시작하거나 끝날 수 없습니다.',
    }),
});

/**
 * 인증이 적용된 프로젝트 생성 API
 */
async function createProjectHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. 인증된 사용자 ID 가져오기
    const ownerId = getUserIdFromRequest(req);
    if (!ownerId) {
      return res.status(401).json({
        message: '인증되지 않은 사용자입니다.',
        code: 'UNAUTHENTICATED'
      });
    }

    // 2. 요청 본문 파싱 및 유효성 검사
    const validationResult = projectCreateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: '입력값 유효성 검사 실패',
        errors: validationResult.error.flatten().fieldErrors,
      });
    }
    const validatedData = validationResult.data;

    // 3. 비즈니스 로직 - 도메인 유일성 검증
    const BASE_DOMAIN = 'intellisia.site';
    const fullDomain = `${validatedData.derivedDomain}.${BASE_DOMAIN}`;

    const existingProjectByDomain = await findProjectByDomainFromDB(fullDomain);
    if (existingProjectByDomain) {
      return res.status(409).json({
        message: `이미 사용 중인 도메인입니다: ${fullDomain}`,
        code: 'DOMAIN_CONFLICT'
      });
    }

    // 4. GitHub URL 소유권 검증 (선택적)
    if (req.user?.githubId) {
      try {
        await validateGitHubRepoAccess(validatedData.githubUrl);
      } catch (error) {
        console.warn('[GitHub Repo Validation]', error);
        // 경고만 로그하고 계속 진행 (선택적 검증)
      }
    }

    // 5. 데이터베이스 저장 로직 호출
    const projectDataToSave: Prisma.ProjectCreateInput = {
      name: validatedData.projectName,
      description: validatedData.description,
      githubUrl: validatedData.githubUrl,
      domain: fullDomain,
      defaultHelmValues: {
        replicaCount: 1,
        port: 8080,
        resources: {
          requests: {
            cpu: '100m',
            memory: '128Mi',
          },
          limits: {
            cpu: '200m',
            memory: '256Mi',
          },
        },
      } as Prisma.JsonObject,
      owner: {
        connect: {
          id: ownerId,
        },
      },
    };

    const newProject = await createProjectInDB(projectDataToSave);

    // 6. 성공 응답
    return res.status(201).json({
      message: '프로젝트가 성공적으로 생성되었습니다.',
      project: {
        id: newProject.id,
        name: newProject.name,
        domain: newProject.domain,
        owner: req.user?.name,
      },
    });

  } catch (error) {
    console.error('프로젝트 생성 중 에러 발생:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target)
          ? error.meta.target.join(', ')
          : String(error.meta?.target);

        if (target.includes('name')) {
          return res.status(409).json({
            message: `프로젝트 이름 '${req.body.projectName}'이(가) 이미 존재합니다.`,
            code: 'NAME_CONFLICT'
          });
        }
        if (target.includes('domain')) {
          return res.status(409).json({
            message: `도메인이 이미 사용 중입니다.`,
            code: 'DOMAIN_CONFLICT'
          });
        }
      }
      return res.status(409).json({
        message: `데이터베이스 저장 중 오류가 발생했습니다.`,
        code: 'DATABASE_ERROR'
      });
    }

    return res.status(500).json({
      message: '프로젝트 생성 중 서버 내부 오류가 발생했습니다.',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * GitHub 저장소 접근 권한 검증 (선택적)
 */
async function validateGitHubRepoAccess(githubUrl: string): Promise<void> {
  try {
    const urlParts = new URL(githubUrl);
    const [, owner, repo] = urlParts.pathname.split('/');
    const repoName = repo.replace('.git', '');

    // GitHub API로 저장소 정보 확인
    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: {
        'User-Agent': 'Intellisia-App',
        // 필요시 인증 토큰 추가
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub repo not accessible: ${response.status}`);
    }

    // response.json()을 호출하되 결과를 사용하지 않음
    await response.json();
    console.log(`[GitHub Validation] Repo ${owner}/${repoName} is accessible`);

  } catch (error) {
    console.warn('[GitHub Repo Validation Failed]', error);
    throw error;
  }
}

/**
 * 메인 핸들러 - 인증 미들웨어 적용
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 인증 미들웨어 적용
  await authenticateUser(req, res, async () => {
    await createProjectHandler(req, res);
  });
}