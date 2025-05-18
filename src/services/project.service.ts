import { projectRepository } from '@/repositories/project.repository';
import { getVersionsByProject } from '@/repositories/version.repository'; // version.repository.ts에 정의되어 있다고 가정
import { toProjectDetailDto } from '@/dtos/project/toProjectDetailDto';   // toProjectDetailDto.ts에 정의되어 있다고 가정
import type { VersionSummary } from '@/types/project'; // project.ts 타입 정의 파일에 있다고 가정
import type { Project } from '@prisma/client';
import type { CreateProjectDto } from '@/dtos/project/CreateProjectDto';

// ApiError 클래스 
export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError'; // 에러 이름 설정
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// 프로젝트 상세 정보 및 버전 목록을 함께 가져오는 함수
export const getProjectDetailWithVersions = async ( // 함수 이름 명확화 (기존 getProjectDetail 역할)
  projectId: number,
  sort: 'asc' | 'desc'
): Promise<ReturnType<typeof toProjectDetailDto>> => { // toProjectDetailDto의 반환 타입으로 명시
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new ApiError(404, `프로젝트 ID '${projectId}'를 찾을 수 없습니다.`);
  }

  const versions: VersionSummary[] = await getVersionsByProject(
    projectId,
    sort
  );

  return toProjectDetailDto(project, versions);
};

class ProjectService {
  async createProject(data: CreateProjectDto): Promise<Project> {
    // 저장소 URL 중복 검사
    const existingProjectByRepo = await projectRepository.findByRepository(data.repository);
    if (existingProjectByRepo) {
      throw new ApiError(409, `저장소 URL '${data.repository}'은(는) 이미 사용 중입니다.`);
    }

    // 도메인 중복 검사
    const existingProjectByDomain = await projectRepository.findByDomain(data.domain);
    if (existingProjectByDomain) {
      throw new ApiError(409, `도메인 '${data.domain}'은(는) 이미 사용 중입니다.`);
    }

    // User 존재 여부 확인은 Prisma의 FK 제약 조건에 의해 처리될 수 있으나,
    // 명시적으로 확인하고 싶다면 projectRepository.create 이전에 로직 추가 가능
    // 예: const user = await prisma.user.findUnique({ where: { id: data.ownerId }});
    //     if (!user) throw new ApiError(404, `소유자 ID '${data.ownerId}'를 찾을 수 없습니다.`);


    const newProject = await projectRepository.create(data);

    // CI/CD 설정 자동화 (비동기 처리)
    this.initiateCiCdSetup(newProject).catch(error => {
      console.error(`[CI/CD Setup Failed for ${newProject.id} - ${newProject.name}]: ${error.message}`);
    });

    return newProject;
  }

  // 이 서비스 메서드는 순수하게 Project 엔티티만 반환
  async getProjectById(id: number): Promise<Project> {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new ApiError(404, `프로젝트 ID '${id}'를 찾을 수 없습니다.`);
    }
    return project;
  }

  async getAllProjects(): Promise<Project[]> {
    return projectRepository.findAll();
  }

  async updateProject(id: number, data: Partial<CreateProjectDto>): Promise<Project> {
    // 업데이트 전 프로젝트 존재 유무 확인 (getProjectById가 404 에러를 던짐)
    await this.getProjectById(id);

    // 저장소 URL 변경 시 중복 검사 (자기 자신은 제외)
    if (data.repository) {
      const existingByRepo = await projectRepository.findByRepository(data.repository);
      if (existingByRepo && existingByRepo.id !== id) {
        throw new ApiError(409, `저장소 URL '${data.repository}'은(는) 이미 다른 프로젝트에서 사용 중입니다.`);
      }
    }

    // 도메인 변경 시 중복 검사 (자기 자신은 제외)
    if (data.domain) {
      const existingByDomain = await projectRepository.findByDomain(data.domain);
      if (existingByDomain && existingByDomain.id !== id) {
        throw new ApiError(409, `도메인 '${data.domain}'은(는) 이미 다른 프로젝트에서 사용 중입니다.`);
      }
    }

    return projectRepository.update(id, data);
  }

  async deleteProject(id: number): Promise<Project> {
    // 삭제 전 프로젝트 존재 유무 확인
    await this.getProjectById(id);
    // 연결된 CI/CD 리소스 정리 등의 로직이 필요하다면 여기에 추가
    return projectRepository.delete(id);
  }

  private async initiateCiCdSetup(project: Project): Promise<void> {
    console.log(`[CI/CD Setup] Initiating for project: ${project.name} (${project.id})`);
    // ... (실제 CI/CD 연동 로직) ...
    await new Promise(resolve => setTimeout(resolve, 1000)); // 예시용 딜레이
    console.log(`[CI/CD Setup] Placeholder setup complete for ${project.name}`);
  }
}

export const projectService = new ProjectService();