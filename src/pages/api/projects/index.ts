// src/pages/api/projects/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { projectService, ApiError } from '@/services/project.service';
import { CreateProjectDto } from '@/dtos/project/CreateProjectDto';
import { plainToInstance } from 'class-transformer'; // DTO 변환용
import { validate } from 'class-validator';         // DTO 유효성 검사용

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // 요청 본문을 CreateProjectDto 인스턴스로 변환
    const createProjectDto = plainToInstance(CreateProjectDto, req.body);

    // DTO 유효성 검사
    const errors = await validate(createProjectDto);
    if (errors.length > 0) {
      // 유효성 검사 오류 메시지를 더 보기 좋게 가공할 수 있습니다.
      const errorMessages = errors.map(error => Object.values(error.constraints || {})).flat();
      return res.status(400).json({ message: '입력값이 올바르지 않습니다.', errors: errorMessages });
    }

    try {
      const newProject = await projectService.createProject(createProjectDto);
      return res.status(201).json(newProject);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.error('[API Error] Failed to create project:', error);
      return res.status(500).json({ message: '프로젝트 생성 중 내부 서버 오류가 발생했습니다.' });
    }
  } else if (req.method === 'GET') {
    try {
      const projects = await projectService.getAllProjects();
      return res.status(200).json(projects);
    } catch (error) {
      if (error instanceof ApiError) { // 거의 발생 안함 (GET all)
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.error('[API Error] Failed to fetch projects:', error);
      return res.status(500).json({ message: '프로젝트 목록 조회 중 내부 서버 오류가 발생했습니다.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}