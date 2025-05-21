import prisma from '@/lib/prisma'; // Prisma 클라이언트 인스턴스
import { Project, Prisma } from '@prisma/client'; // Prisma에서 생성된 타입들

/**
 * 데이터베이스에 새로운 프로젝트를 생성합니다.
 * 에러 발생 시 호출한 서비스로 에러를 전파합니다.
 * @param projectData 생성할 프로젝트 데이터 (Prisma.ProjectCreateInput 타입)
 * @returns 생성된 Project 객체
<<<<<<< HEAD
=======
 * @throws PrismaClientKnownRequestError 등 DB 관련 에러 발생 가능
>>>>>>> main
 */
export const createProjectInDB = async (
  projectData: Prisma.ProjectCreateInput
): Promise<Project> => {
  const newProject = await prisma.project.create({
    data: projectData,
  });
  return newProject;
};

/**
<<<<<<< HEAD
 * 주어진 도메인명으로 프로젝트를 조회합니다.
 * 프로젝트 생성 시 도메인 중복 검사에 사용됩니다.
 * 에러 발생 시 호출한 서비스로 에러를 전파합니다.
 * @param domain 조회할 도메인명
 * @returns Project 객체 또는 null (찾지 못한 경우)
=======
 * 주어진 ID로 특정 프로젝트를 조회합니다.
 * 에러 발생 시 호출한 서비스로 에러를 전파합니다.
 * @param projectId 조회할 프로젝트의 ID
 * @param includeRelations (선택적) 함께 로드할 관계 (예: { owner: true })
 * @returns Project 객체 또는 null (찾지 못한 경우)
 * @throws PrismaClientKnownRequestError 등 DB 관련 에러 발생 가능
 */
export const findProjectByIdFromDB = async (
  projectId: number,
  includeRelations?: Prisma.ProjectInclude
): Promise<Project | null> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: includeRelations,
  });
  return project;
};

/**
 * 주어진 도메인명으로 프로젝트를 조회합니다.
 * 도메인 중복 검사 등에 유용합니다.
 * 에러 발생 시 호출한 서비스로 에러를 전파합니다.
 * @param domain 조회할 도메인명
 * @returns Project 객체 또는 null (찾지 못한 경우)
 * @throws PrismaClientKnownRequestError 등 DB 관련 에러 발생 가능
>>>>>>> main
 */
export const findProjectByDomainFromDB = async (
  domain: string
): Promise<Project | null> => {
  const project = await prisma.project.findUnique({
    where: { domain: domain },
  });
  return project;
<<<<<<< HEAD
};
=======
};

/**
 * 특정 사용자가 소유한 모든 프로젝트 목록을 조회합니다.
 * (예: "내 프로젝트" 목록 기능에 사용)
 * 에러 발생 시 호출한 서비스로 에러를 전파합니다.
 * @param ownerId 소유자의 ID
 * @param options (선택적) 정렬, 페이지네이션, 관계 포함 등의 옵션
 * @returns Project 객체의 배열
 * @throws PrismaClientKnownRequestError 등 DB 관련 에러 발생 가능
 */
export const findProjectsByOwnerIdFromDB = async (
  ownerId: number,
  options?: {
    orderBy?: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[];
    skip?: number;
    take?: number;
    include?: Prisma.ProjectInclude;
  }
): Promise<Project[]> => {
  const projects = await prisma.project.findMany({
    where: { ownerId: ownerId },
    orderBy: options?.orderBy || { createdAt: 'desc' },
    skip: options?.skip,
    take: options?.take,
    include: options?.include,
  });
  return projects;
};

/**
 * 시스템에 있는 모든 프로젝트 목록을 조회합니다.
 * 로그인한 사용자가 (권한 구분 없이) 모든 프로젝트를 볼 수 있는 시나리오에 사용됩니다.
 * 에러 발생 시 호출한 서비스로 에러를 전파합니다.
 * @param options (선택적) 정렬, 페이지네이션, 관계 포함 등의 옵션 (예: 소유자 정보 포함)
 * @returns Project 객체의 배열
 * @throws PrismaClientKnownRequestError 등 DB 관련 에러 발생 가능
 */
export const findAllProjectsDB = async (
  options?: {
    orderBy?: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[];
    skip?: number;
    take?: number;
    include?: Prisma.ProjectInclude; // 예: { owner: { select: { id: true, name: true, email: true } } }
  }
): Promise<Project[]> => {
  const projects = await prisma.project.findMany({
    orderBy: options?.orderBy || { createdAt: 'desc' }, // 기본 정렬: 최신 생성일 순
    skip: options?.skip,
    take: options?.take,
    include: options?.include,
  });
  return projects;
};

// Project 모델과 관련된 다른 DB 접근 함수들은 필요에 따라 여기에 추가할 수 있습니다.
// 예: updateProjectInDB, deleteProjectFromDB 등
>>>>>>> main
