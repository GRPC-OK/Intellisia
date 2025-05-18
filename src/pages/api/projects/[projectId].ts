import { NextApiRequest, NextApiResponse } from 'next';
import {
  projectService, // projectService 인스턴스 사용
  ApiError,       // 서비스 파일에 정의된 ApiError 사용
  getProjectDetailWithVersions, // 상세 조회 함수
} from '@/services/project.service';
import { CreateProjectDto } from '@/dtos/project/CreateProjectDto'; // 업데이트 시 부분적으로 활용 (또는 UpdateProjectDto)
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId: projectIdQuery } = req.query;

  // projectId 유효성 검사 (문자열 및 숫자 변환 가능 여부)
  if (typeof projectIdQuery !== 'string') {
    return res.status(400).json({ message: 'Project ID는 문자열이어야 합니다.' });
  }

  const projectId = Number(projectIdQuery);

  if (isNaN(projectId)) {
    return res.status(400).json({ message: 'Project ID는 유효한 숫자여야 합니다.' });
  }

  try {
    // GET 요청 처리 (프로젝트 상세 정보 조회)
    if (req.method === 'GET') {
      const sortQuery = (req.query.sort === 'oldest' ? 'asc' : 'desc') as 'asc' | 'desc';
      // 서비스의 getProjectDetailWithVersions 함수 사용 (이름은 실제 함수명에 맞춰주세요)
      const projectDetail = await getProjectDetailWithVersions(projectId, sortQuery);
      // getProjectDetailWithVersions 내부에서 못 찾으면 ApiError(404,...)를 throw 하므로, 여기선 별도 null 체크 불필요
      return res.status(200).json(projectDetail);

    // PUT 요청 처리 (프로젝트 수정)
    } else if (req.method === 'PUT') {
      // CreateProjectDto를 부분적으로 사용하여 업데이트 DTO로 활용
      // 또는 UpdateProjectDto를 별도로 정의하여 사용
      const updateDataDto = plainToInstance(CreateProjectDto, req.body as Partial<CreateProjectDto>);

      const errors = await validate(updateDataDto, {
        skipMissingProperties: true, // DTO의 모든 필드가 필수가 아님 (부분 업데이트 허용)
        whitelist: true,             // DTO에 정의되지 않은 속성은 자동으로 제거
        // forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 오류 발생 (필요시 활성화)
      });

      if (errors.length > 0) {
        const errorMessages = errors.map(error => Object.values(error.constraints || {})).flat();
        return res.status(400).json({ message: '입력값 유효성 검사에 실패했습니다.', errors: errorMessages });
      }

      const updatedProject = await projectService.updateProject(projectId, req.body as Partial<CreateProjectDto>);
      return res.status(200).json(updatedProject);

    // DELETE 요청 처리 (프로젝트 삭제)
    } else if (req.method === 'DELETE') {
      await projectService.deleteProject(projectId);
      return res.status(204).end(); // No Content

    // 그 외 지원하지 않는 메서드
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    // 에러 로깅 (어떤 API 경로에서 발생했는지 포함)
    console.error(`[API Error /api/projects/${projectIdQuery}] (${req.method})`, error);

    // ApiError 인스턴스인 경우 해당 상태 코드와 메시지 반환
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    // 그 외 서버 내부 오류
    return res.status(500).json({ message: '내부 서버 오류가 발생했습니다.' });
  }
}