import prisma from '@/lib/prisma'; // Prisma 클라이언트 (트랜잭션 등에 필요할 수 있음)
import { Project, User, Prisma as PrismaTypes, ProjectContributors } from '@prisma/client'; // Prisma 모델 타입
import { ValidatedCreateProjectData } from '@/validators/project.validators'; // 유효성 검사 통과 데이터 타입

// --- 데이터 접근 계층(DAL) 또는 Repository 함수 import ---
// 중요: 아래 경로는 실제 프로젝트 구조에 맞게 정확히 수정해야 합니다.
import { findUserById } from '@/services/db-access-service/user.db.service'; // 또는 user.repository.ts
import {
  createProjectInDB,
  findProjectByDomainFromDB,
  findProjectByIdFromDB as getProjectById, // findProjectByIdFromDB를 getProjectById 별칭으로 사용
} from '@/services/db-access-service/project.db.service'; // 또는 project.repository.ts
import { getVersionsByProject } from '@/repositories/version.repository'; // 또는 version.db.service.ts

// --- DTO 및 타입 import ---
import { toProjectDetailDto } from '@/dtos/project/toProjectDetailDto'; // 실제 경로 확인
import { VersionSummary } from '@/types/project'; // 실제 경로 확인

// toProjectDetailDto가 기대하는 Project 타입 (owner와 contributors 포함)
// Prisma.ProjectGetPayload를 사용하면 더 정확한 타입을 생성할 수 있습니다.
// 예시 타입이며, 실제 toProjectDetailDto의 파라미터 타입에 맞춰야 합니다.
type ProjectForDetailDto = Project & {
  owner: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'> | null; // User의 일부 필드만 선택
  contributors: Array<{
    user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'> | null; // User의 일부 필드만 선택
    // ProjectContributors 모델의 다른 필드가 필요하다면 여기에 추가
  }>;
};


// ========================================================================
// 기존 코드: 프로젝트 상세 정보 조회 (협업 환경 코드 - 수정됨)
// ========================================================================
export const getProjectDetail = async (
  projectId: number,
  sort: 'asc' | 'desc'
) => {
  const includeOptions: PrismaTypes.ProjectInclude = {
    owner: {
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    },
    contributors: {
      select: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    },
  };

  const project = await getProjectById(projectId, includeOptions);

  if (!project) {
    return null;
  }

  const versions: VersionSummary[] = await getVersionsByProject(
    projectId,
    sort
  );

  // toProjectDetailDto가 위에서 정의한 ProjectForDetailDto 또는
  // Prisma.ProjectGetPayload<{ include: typeof includeOptions }> 타입과 호환되어야 합니다.
  return toProjectDetailDto(project as ProjectForDetailDto, versions);
};

// ========================================================================
// 새로 추가된 코드: 신규 프로젝트 생성
// ========================================================================
/**
 * 새로운 프로젝트를 생성합니다.
 * 유효성 검사를 통과한 데이터를 입력받아 소유자 확인, 도메인 중복 검사를 거친 후
 * 데이터베이스에 프로젝트를 저장합니다.
 *
 * @param validatedData 유효성 검사를 통과한 프로젝트 생성 데이터.
 * @param ownerId 프로젝트 소유자(User)의 ID.
 * @returns 생성된 Project 객체.
 * @throws Error 사용자를 찾을 수 없거나, 도메인이 이미 사용 중이거나, DB 작업 실패 시.
 */
export const createNewProject = async (
  validatedData: ValidatedCreateProjectData,
  ownerId: number
): Promise<Project> => {
  // 1. 소유자(User) 존재 유무 확인
  const owner = await findUserById(ownerId);
  if (!owner) {
    // 실제 애플리케이션에서는 NotFoundError 등 구체적인 커스텀 에러를 사용하는 것이 좋습니다.
    throw new Error(`프로젝트 소유자 정보를 찾을 수 없습니다 (ID: ${ownerId}).`);
  }

  // 2. 도메인 중복 확인
  const existingProjectWithDomain = await findProjectByDomainFromDB(
    validatedData.domain
  );
  if (existingProjectWithDomain) {
    // 실제 애플리케이션에서는 ConflictError 등 구체적인 커스텀 에러를 사용하는 것이 좋습니다.
    throw new Error(`이미 사용 중인 도메인입니다: ${validatedData.domain}`);
  }

  // 3. DB 저장용 데이터 최종 준비
  const projectDataForDb: PrismaTypes.ProjectCreateInput = {
    name: validatedData.projectName,
    description: validatedData.description || '',
    githubUrl: validatedData.githubUrl,
    domain: validatedData.domain,
    defaultHelmValues: validatedData.defaultHelmValues, // Zod에서 이미 올바른 객체 구조로 검증됨
    owner: { // 관계 필드를 통해 User와 연결
      connect: { id: ownerId },
    },
  };

  // 4. 데이터베이스에 Project 레코드 생성
  const newProject = await createProjectInDB(projectDataForDb);

  return newProject;
};
