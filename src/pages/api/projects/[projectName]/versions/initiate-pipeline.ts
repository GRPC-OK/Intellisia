import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, StepStatus, AnalysisStatus, FlowStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface RequestBody {
  branch: string;
  applicationName: string;
  dockerfilePath: string;
  helmValueOverrides?: {
    replicaCount?: number;
    containerPort?: number;
    resources?: {
      requests?: {
        cpu?: string;
        memory?: string;
      };
    };
    [key: string]: string | number | boolean | { [key: string]: string | number | boolean };
  };
}

type ApiResponse = {
  message: string;
  versionId?: number;
  versionName?: string;
  error?: string;
  detail?: any;
};

function calculateResourceLimit(requestValue: string | undefined, multiplier: number, defaultUnitSuffix: string = ''): string | undefined {
  if (!requestValue) return undefined;
  const numericPart = parseFloat(requestValue);
  if (isNaN(numericPart)) return requestValue;
  const calculatedValue = Math.ceil(numericPart * multiplier);
  const unit = requestValue.replace(/[0-9.-]/g, '') || defaultUnitSuffix;
  return `${calculatedValue}${unit}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // --- ▼▼▼ 요청 본문 로깅 추가 ▼▼▼ ---
  console.log('Request received. Method:', req.method, 'Query:', req.query);
  console.log('Request body:', req.body);
  // --- ▲▲▲ 요청 본문 로깅 추가 ▲▲▲ ---

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `메서드 ${req.method}는 허용되지 않습니다.` });
  }

  const { projectName } = req.query as { projectName?: string };

  try {
    if (!projectName) {
      return res.status(400).json({ message: 'URL 경로에 Project 이름이 필요합니다.' });
    }

    // 요청 본문이 없거나 비어있는 경우에 대한 방어 코드 추가
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: '요청 본문(body)이 비어 있습니다.' });
    }

    const {
      branch: requestedBranchName,
      applicationName,
      dockerfilePath,
      helmValueOverrides,
    }: RequestBody = req.body;

    if (!requestedBranchName || !applicationName || !dockerfilePath) {
      return res.status(400).json({ message: '필수 입력값이 누락되었습니다 (branch, applicationName, dockerfilePath).' });
    }

    // 1. Project 조회
    // !!! 중요: Project 모델의 'name' 필드에 @unique 제약조건을 추가하고 마이그레이션해야 합니다. !!!
    const project = await prisma.project.findUnique({
      where: { name: projectName },
    });

    if (!project) {
      return res.status(404).json({ message: `프로젝트 '${projectName}'를 찾을 수 없습니다.` });
    }
    if (applicationName !== project.name) {
        return res.status(400).json({ message: '애플리케이션 이름이 프로젝트 이름과 일치하지 않습니다.'});
    }

    const targetCommitSha = "simulated-commit-sha-1234567";
    console.log(`(최소 기능 시뮬레이션) 브랜치: '${requestedBranchName}', 커밋 SHA: ${targetCommitSha}`);

    const cleanBranchName = requestedBranchName.replace(/[^a-zA-Z0-9-]/g, '-');
    const versionName = `${cleanBranchName}-${targetCommitSha.substring(0, 7)}`;

    const defaultHelm = project.defaultHelmValues as Prisma.JsonObject | undefined | null;
    const overrideRequests = helmValueOverrides?.resources?.requests;

    let defaultProjectReplicaCount = 1;
    if (defaultHelm && typeof defaultHelm['replicaCount'] === 'number') {
        defaultProjectReplicaCount = defaultHelm['replicaCount'] as number;
    }

    let defaultProjectContainerPort = 8080;
    if (defaultHelm && typeof defaultHelm['containerPort'] === 'number') {
        defaultProjectContainerPort = defaultHelm['containerPort'] as number;
    }

    let defaultProjectCpuRequest = "100m";
    if (defaultHelm && typeof defaultHelm['resources'] === 'object' && defaultHelm['resources'] &&
        typeof (defaultHelm['resources'] as Prisma.JsonObject)['requests'] === 'object' && (defaultHelm['resources'] as Prisma.JsonObject)['requests'] &&
        typeof ((defaultHelm['resources'] as Prisma.JsonObject)['requests'] as Prisma.JsonObject)['cpu'] === 'string') {
        defaultProjectCpuRequest = ((defaultHelm['resources'] as Prisma.JsonObject)['requests'] as Prisma.JsonObject)['cpu'] as string;
    }

    let defaultProjectMemoryRequest = "128Mi";
    if (defaultHelm && typeof defaultHelm['resources'] === 'object' && defaultHelm['resources'] &&
        typeof (defaultHelm['resources'] as Prisma.JsonObject)['requests'] === 'object' && (defaultHelm['resources'] as Prisma.JsonObject)['requests'] &&
        typeof ((defaultHelm['resources'] as Prisma.JsonObject)['requests'] as Prisma.JsonObject)['memory'] === 'string') {
        defaultProjectMemoryRequest = ((defaultHelm['resources'] as Prisma.JsonObject)['requests'] as Prisma.JsonObject)['memory'] as string;
    }

    const finalCpuRequest = overrideRequests?.cpu || defaultProjectCpuRequest;
    const finalMemoryRequest = overrideRequests?.memory || defaultProjectMemoryRequest;

    const finalHelmValues: Prisma.JsonObject = {
      replicaCount: helmValueOverrides?.replicaCount ?? defaultProjectReplicaCount,
      containerPort: helmValueOverrides?.containerPort ?? defaultProjectContainerPort,
      resources: {
        requests: {
          cpu: finalCpuRequest,
          memory: finalMemoryRequest,
        },
        limits: {
          cpu: calculateResourceLimit(finalCpuRequest, 2, 'm'),
          memory: calculateResourceLimit(finalMemoryRequest, 2, 'Mi'),
        },
      },
    };
    if (helmValueOverrides) {
        for (const key in helmValueOverrides) {
            if (!['replicaCount', 'containerPort', 'resources'].includes(key)) {
                finalHelmValues[key] = helmValueOverrides[key];
            }
        }
    }

    const newVersion = await prisma.$transaction(async (tx) => {
      const createdHelmValues = await tx.helmValues.create({
        data: { content: finalHelmValues },
      });

      const versionData = await tx.version.create({
        data: {
          name: versionName,
          description: `"${requestedBranchName}" 브랜치 실행 (최소 기능)`,
          isCurrent: false,
          imageTag: 'pending-build',
          branch: requestedBranchName,
          commitHash: targetCommitSha,
          applicationName: applicationName,
          codeStatus: StepStatus.pending,
          buildStatus: StepStatus.none,
          imageStatus: StepStatus.none,
          deployStatus: StepStatus.none,
          approveStatus: 'none',
          flowStatus: FlowStatus.pending,
          projectId: project.id,
          authorId: project.ownerId || 1,
          helmValuesId: createdHelmValues.id,
        },
      });

      await tx.codeAnalysis.create({
        data: { versionId: versionData.id, status: AnalysisStatus.pending, hasIssue: false }
      });
      return versionData;
    });

    console.log(`(최소 기능 시뮬레이션) CI/CD 파이프라인 트리거됨 for Version ID: ${newVersion.id}`);

    return res.status(201).json({
      message: "요청 성공 (최소 기능)",
      versionId: newVersion.id,
      versionName: newVersion.name,
    });

  } catch (error: any) {
    console.error("오류 발생 (최소 기능):", error); // 여기에 상세 에러가 찍힙니다.
    let statusCode = 500;
    let publicErrorMessage = "서버 내부 오류가 발생했습니다.";

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      publicErrorMessage = "데이터베이스 처리 중 오류가 발생했습니다.";
      if (error.code === 'P2025') {
          publicErrorMessage = `요청하신 프로젝트 '${projectName}'를 찾을 수 없습니다.`; // 에러 메시지에 projectName 추가
          statusCode = 404;
      } else if (error.code === 'P2002') {
          publicErrorMessage = `고유해야 하는 값이 이미 존재합니다: ${Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : error.meta?.target || '확인 필요'}`;
          statusCode = 409;
      }
    }
    return res.status(statusCode).json({
      message: publicErrorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : "오류 발생",
      detail: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}