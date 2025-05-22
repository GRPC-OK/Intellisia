import prisma from '@/lib/prisma'; // Prisma 클라이언트 인스턴스
import { Project, Prisma } from '@prisma/client'; // Prisma에서 생성된 타입들

/**
 * 데이터베이스에 새로운 프로젝트를 생성합니다.
 * 에러 발생 시 호출한 서비스로 에러를 전파합니다.
 * @param projectData 생성할 프로젝트 데이터 (Prisma.ProjectCreateInput 타입)
 * @returns 생성된 Project 객체
 */

export const createProjectInDB = async (
  projectData: Prisma.ProjectCreateInput
): Promise<Project> => {
  const newProject = await prisma.project.create({
    data: projectData,
    include: {
    owner: true, // 이걸 넣어야 toProjectDetailDto()에서 타입 충돌이 안 남
  },
  });
  return newProject;
};

/**
 * 주어진 도메인명으로 프로젝트를 조회합니다.
 * 프로젝트 생성 시 도메인 중복 검사에 사용됩니다.
 * 에러 발생 시 호출한 서비스로 에러를 전파합니다.
 * @param domain 조회할 도메인명
 * @returns Project 객체 또는 null (찾지 못한 경우)
 */
export const findProjectByDomainFromDB = async (
  domain: string
): Promise<Project | null> => {
  const project = await prisma.project.findUnique({
    where: { domain: domain },
  });
  return project;
};
