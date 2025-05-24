import {
  getProjectById,
  getProjectByName,
} from '@/repositories/project.repository';
import { toProjectDetailDto } from '@/dtos/project/toProjectDetailDto';

export const getProjectDetail = async (projectId: number) => {
  const project = await getProjectById(projectId);
  if (!project) return null;
  return toProjectDetailDto(project);
};

export const getProjectDetailByName = async (projectName: string) => {
  const project = await getProjectByName(projectName);
  if (!project) return null;
  return toProjectDetailDto(project);
};
