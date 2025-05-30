// src/pages/api/project/create.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import {
  findProjectByDomainFromDB,
  createProjectInDB,
} from '@/services/db-access-service/project.db.service';

// 요청 본문 유효성 검사를 위한 Zod 스키마 정의
// defaultHelmValues 필드를 Zod 스키마에서 제거합니다.
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      // 2. 인증 및 ownerId 확보
      // const ownerId = await getUserIdFromRequest(req);
      const ownerId = 1;
      if (!ownerId) {
        return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
      }

      // 3. 요청 본문 파싱 및 유효성 검사
      const validationResult = projectCreateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res
          .status(400)
          .json({
            message: '입력값 유효성 검사 실패',
            errors: validationResult.error.flatten().fieldErrors,
          });
      }
      const validatedData = validationResult.data;

      // 4. 비즈니스 로직 - 도메인 유일성 검증
      const BASE_DOMAIN = 'intellisia.site'; // 프론트엔드와 일관성을 위해 BASE_DOMAIN을 정의
      const fullDomain = `${validatedData.derivedDomain}.${BASE_DOMAIN}`; // 실제 저장될 전체 도메인

      const existingProjectByDomain =
        await findProjectByDomainFromDB(fullDomain); // 실제 사용할 전체 도메인명으로 검사
      if (existingProjectByDomain) {
        return res
          .status(409)
          .json({ message: `이미 사용 중인 도메인입니다: ${fullDomain}` });
      }

      // 5. 데이터베이스 저장 로직 호출.
      const projectDataToSave: Prisma.ProjectCreateInput = {
        name: validatedData.projectName,
        description: validatedData.description,
        githubUrl: validatedData.githubUrl,
        domain: fullDomain, // 검증된 전체 도메인 저장
        // defaultHelmValues에 하드코딩된 기본값을 직접 삽입합니다.
        defaultHelmValues: {
          replicaCount: 1,
          port: 8080,
          resources: {
            requests: {
              cpu: '100m',
              memory: '128Mi',
            },
            limits: {
              cpu: '200m', // 예시: 요청의 2배
              memory: '256Mi', // 예시: 요청의 2배
            },
          },
        } as Prisma.JsonObject, // Prisma.JsonObject로 타입 단언
        owner: {
          // 'owner' 관계를 통해 User에 연결합니다.
          connect: {
            id: ownerId, // ownerId는 인증된 사용자의 ID입니다.
          },
        },
        // status: 'INITIALIZING', // 필요한 경우 주석 해제
      };

      const newProject = await createProjectInDB(projectDataToSave);

      // 6. 응답 처리 (성공)
      return res
        .status(201)
        .json({
          message: '프로젝트가 성공적으로 생성되었습니다.',
          project: {
            id: newProject.id,
            name: newProject.name,
            domain: newProject.domain,
          },
        });
    } catch (error) {
      console.error('프로젝트 생성 중 에러 발생:', error);
      // 데이터베이스 관련 에러 또는 기타 예기치 않은 에러 처리
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // 예: 고유 제약 조건 위반 (P2002) 등 Prisma 특정 에러 처리
        // 이 경우는 도메인 중복 검사에서 이미 처리되었을 가능성이 높음
        if (error.code === 'P2002') {
          // 중복 필드에 대한 추가 처리 (예: name, domain 중복)
          const target = Array.isArray(error.meta?.target)
            ? error.meta.target.join(', ')
            : String(error.meta?.target);
          if (target.includes('name')) {
            return res
              .status(409)
              .json({
                message: `프로젝트 이름 '${req.body.projectName}'이(가) 이미 존재합니다. 다른 이름을 사용해주세요.`,
              });
          }
          if (target.includes('domain')) {
            return res
              .status(409)
              .json({
                message: `도메인 '${req.body.derivedDomain}.intellisia.site'이(가) 이미 사용 중입니다. 다른 프로젝트 이름을 사용해주세요.`,
              });
          }
        }
        return res
          .status(409)
          .json({
            message: `데이터베이스 저장 중 오류가 발생했습니다. 입력값을 확인해주세요. (코드: ${error.code})`,
          });
      }
      return res
        .status(500)
        .json({ message: '프로젝트 생성 중 서버 내부 오류가 발생했습니다.' });
    }
  } else {
    // POST가 아닌 다른 HTTP 메소드 요청은 허용하지 않음
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
