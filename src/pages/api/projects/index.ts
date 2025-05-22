// src/pages/api/projects/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma'; // Prisma 클라이언트
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { findProjectByDomainFromDB, createProjectInDB } from '@/services/db-access-service/project.db.service';

// 여기에 인증 관련 함수/미들웨어를 import 하거나 직접 구현합니다.
// 예시: import { getUserIdFromRequest } from '@/lib/auth';
// 임시로 userId를 하드코딩하거나, 실제 인증 로직으로 대체해야 합니다.
const getUserIdFromRequest = async (req: NextApiRequest): Promise<number | null> => {
  // 실제 인증 로직: 헤더의 토큰 검증, 세션 확인 등
  // 예시: const session = await getSession({ req }); if (session?.user?.id) return session.user.id;
  console.warn("주의: 임시 사용자 ID (1) 사용 중. 실제 인증 로직으로 교체 필요!");
  return 1; // MVP를 위해 임시로 사용자 ID 1을 반환
};


// 요청 본문 유효성 검사를 위한 Zod 스키마 정의
const projectCreateSchema = z.object({
  projectName: z.string().min(1, { message: '프로젝트 이름은 필수입니다.' }),
  description: z.string().optional(),
  githubUrl: z.string().url({ message: '올바른 GitHub URL 형식이 아닙니다.' }).regex(/\.git$/, { message: 'GitHub URL은 .git으로 끝나야 합니다.' }),
  derivedDomain: z.string().min(1, { message: '도메인 이름은 필수입니다.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: '도메인은 소문자 영숫자와 하이픈(-)만 사용 가능하며, 하이픈으로 시작하거나 끝날 수 없습니다.'}),
  defaultHelmValues: z.object({
    replicaCount: z.number().int().nonnegative({ message: '레플리카 수는 0 이상이어야 합니다.' }),
    containerPort: z.number().int().min(1, { message: '컨테이너 포트는 1 이상이어야 합니다.' }).max(65535, { message: '컨테이너 포트는 65535 이하여야 합니다.' }),
    // 필요에 따라 defaultHelmValues에 대한 추가 필드 정의
  }).passthrough(), // 스키마에 정의되지 않은 추가 속성도 허용 (주의해서 사용)
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      // 2. 인증 및 ownerId 확보
      const ownerId = await getUserIdFromRequest(req);
      if (!ownerId) {
        return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
      }

      // 3. 요청 본문 파싱 및 유효성 검사
      const validationResult = projectCreateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: '입력값 유효성 검사 실패', errors: validationResult.error.flatten().fieldErrors });
      }
      const validatedData = validationResult.data;

      // 4. 비즈니스 로직 - 도메인 유일성 검증
      const existingProjectByDomain = await findProjectByDomainFromDB(validatedData.derivedDomain + '.intellisia.app'); // 실제 사용할 전체 도메인명으로 검사
      if (existingProjectByDomain) {
        // 중요: 실제 도메인 생성 규칙에 따라 `derivedDomain`에 기본 도메인(.intellisia.app 등)을 결합하여 검사해야 합니다.
        // 프론트엔드의 `derivedDomain` 필드와 `BASE_DOMAIN`을 참고하여 일관성 유지.
        // 여기서는 예시로 '.intellisia.app'을 추가했습니다.
        return res.status(409).json({ message: `이미 사용 중인 도메인입니다: ${validatedData.derivedDomain}.intellisia.app` });
      }
      
      const fullDomain = `${validatedData.derivedDomain}.intellisia.app`; // 실제 저장될 전체 도메인

      // 5. 데이터베이스 저장 로직 호출
      const projectDataToSave: Prisma.ProjectCreateInput = {
        name: validatedData.projectName,
        description: validatedData.description,
        githubUrl: validatedData.githubUrl,
        domain: fullDomain, // 검증된 전체 도메인 저장
        defaultHelmValues: validatedData.defaultHelmValues as Prisma.JsonObject, // Zod 객체를 Prisma.JsonObject로 타입 단언
        owner: { // 'owner' 관계를 통해 User에 연결합니다.
          connect: {
            id: ownerId // ownerId는 인증된 사용자의 ID입니다.
          }
        },
        // status: 'INITIALIZING', // 필요한 경우 주석 해제
      };
      
      const newProject = await createProjectInDB(projectDataToSave);

      // 6. 응답 처리 (성공)
      return res.status(201).json({ message: '프로젝트가 성공적으로 생성되었습니다.', project: { id: newProject.id, name: newProject.name, domain: newProject.domain } });

    } catch (error) {
      console.error('프로젝트 생성 중 에러 발생:', error);
      // 데이터베이스 관련 에러 또는 기타 예기치 않은 에러 처리
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // 예: 고유 제약 조건 위반 (P2002) 등 Prisma 특정 에러 처리
        // 이 경우는 도메인 중복 검사에서 이미 처리되었을 가능성이 높음
        return res.status(409).json({ message: '데이터베이스 저장 중 오류가 발생했습니다. 입력값을 확인해주세요.' });
      }
      return res.status(500).json({ message: '프로젝트 생성 중 서버 내부 오류가 발생했습니다.' });
    }
  } else {
    // POST가 아닌 다른 HTTP 메소드 요청은 허용하지 않음
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}