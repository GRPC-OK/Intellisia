import prisma from '@/lib/prisma'; // Prisma 클라이언트 인스턴스
import { Project, Prisma } from '@prisma/client'; // Prisma에서 생성된 타입들

/**
 * 데이터베이스에 새로운 프로젝트를 생성합니다.
 * 에러 발생 시 호출한 서비스로 에러를 전파합니다.
 * @param projectData 생성할 프로젝트 데이터 (Prisma.ProjectCreateInput 타입)
 * @returns 생성된 Project 객체
 * @throws PrismaClientKnownRequestError 등 DB 관련 에러 발생 가능
 */
export const createProjectInDB = async (
  projectData: Prisma.ProjectCreateInput
): Promise<Project> => {
  // try...catch 블록 없이, 에러는 호출한 곳으로 전파됩니다.
  const newProject = await prisma.project.create({
    data: projectData,
  });
  return newProject;
};

/**
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
 */
export const findProjectByDomainFromDB = async (
  domain: string
): Promise<Project | null> => {
  const project = await prisma.project.findUnique({
    where: { domain: domain },
  });
  return project;
};

/**
 * 특정 사용자가 소유한 모든 프로젝트 목록을 조회합니다.
 * 에러 발생 시 호출한 서비스로 에러를 전파합니다.
 * @param ownerId 소유자의 ID
 * @returns Project 객체의 배열
 * @throws PrismaClientKnownRequestError 등 DB 관련 에러 발생 가능
 */
export const findProjectsByOwnerIdFromDB = async (
  ownerId: number
): Promise<Project[]> => {
  const projects = await prisma.project.findMany({
    where: { ownerId: ownerId },
    orderBy: { createdAt: 'desc' }, // 예시: 최신 생성일 순으로 정렬
  });
  return projects;
};

// Project 모델과 관련된 다른 DB 접근 함수들은 필요에 따라 여기에 추가할 수 있습니다.
// 예: updateProjectInDB, deleteProjectFromDB 등