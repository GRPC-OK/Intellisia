import type { NextApiRequest, NextApiResponse } from 'next';
import {
  PrismaClient,
  StepStatus,
  AnalysisStatus,
  FlowStatus,
  Prisma,
  Project,
  Version,
  HelmValues,
} from '@prisma/client';

const prisma = new PrismaClient();

interface HelmResourcesRequests {
  cpu?: string;
  memory?: string;
}

interface HelmResources {
  requests?: HelmResourcesRequests;
}

interface HelmValueOverrides {
  replicaCount?: number;
  containerPort?: number;
  resources?: HelmResources;
  [key: string]: unknown;
}

interface RequestBody {
  branch: string;
  applicationName: string;
  dockerfilePath: string;
  helmValueOverrides?: HelmValueOverrides;
}

type ApiResponse = {
  message: string;
  versionId?: number;
  versionName?: string;
  error?: string;
  detail?: string;
};

function calculateResourceLimit(
  requestValue: string | undefined,
  multiplier: number,
  defaultUnitSuffix: string = ''
): string | undefined {
  if (!requestValue) return undefined;
  const numericPart = parseFloat(requestValue);
  if (isNaN(numericPart)) return requestValue;
  const calculatedValue = Math.ceil(numericPart * multiplier);
  const unit = requestValue.replace(/[0-9.-]/g, '') || defaultUnitSuffix;
  return `${calculatedValue}${unit}`;
}

const getJsonValue = <T>(
  obj: Prisma.JsonValue | null | undefined,
  path: string[],
  defaultValue: T
): T => {
  let current: unknown = obj;
  for (const key of path) {
    if (
      typeof current !== 'object' ||
      current === null ||
      !Object.prototype.hasOwnProperty.call(current, key)
    ) {
      return defaultValue;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current as T;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  console.log('Request received. Method:', req.method, 'Query:', req.query);
  console.log('Request body:', req.body);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res
      .status(405)
      .json({ message: `메서드 ${req.method}는 허용되지 않습니다.` });
  }

  const { projectName } = req.query as { projectName?: string };

  try {
    if (!projectName) {
      return res
        .status(400)
        .json({ message: 'URL 경로에 Project 이름이 필요합니다.' });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ message: '요청 본문(body)이 비어 있습니다.' });
    }

    const {
      branch: requestedBranchName,
      applicationName,
      dockerfilePath,
      helmValueOverrides,
    }: RequestBody = req.body as RequestBody;

    if (!requestedBranchName || !applicationName || !dockerfilePath) {
      return res.status(400).json({
        message:
          '필수 입력값이 누락되었습니다 (branch, applicationName, dockerfilePath).',
      });
    }

    const project: Project | null = await prisma.project.findUnique({
      where: { name: projectName },
    });

    if (!project) {
      return res
        .status(404)
        .json({ message: `프로젝트 '${projectName}'를 찾을 수 없습니다.` });
    }
    if (applicationName !== project.name) {
      return res.status(400).json({
        message: '애플리케이션 이름이 프로젝트 이름과 일치하지 않습니다.',
      });
    }

    const targetCommitSha = 'simulated-commit-sha-1234567';
    console.log(
      `(최소 기능 시뮬레이션) 브랜치: '${requestedBranchName}', 커밋 SHA: ${targetCommitSha}`
    );

    const cleanBranchName = requestedBranchName.replace(/[^a-zA-Z0-9-]/g, '-');
    const versionName = `${cleanBranchName}-${targetCommitSha.substring(0, 7)}`;

    const defaultHelm = project.defaultHelmValues;
    const overrideRequests = helmValueOverrides?.resources?.requests;

    const defaultProjectReplicaCount =
      getJsonValue<number | undefined>(
        defaultHelm,
        ['replicaCount'],
        undefined
      ) ?? 1;
    const defaultProjectContainerPort =
      getJsonValue<number | undefined>(
        defaultHelm,
        ['containerPort'],
        undefined
      ) ?? 8080;
    const defaultProjectCpuRequest =
      getJsonValue<string | undefined>(
        defaultHelm,
        ['resources', 'requests', 'cpu'],
        undefined
      ) ?? '100m';
    const defaultProjectMemoryRequest =
      getJsonValue<string | undefined>(
        defaultHelm,
        ['resources', 'requests', 'memory'],
        undefined
      ) ?? '128Mi';

    const finalCpuRequest = overrideRequests?.cpu || defaultProjectCpuRequest;
    const finalMemoryRequest =
      overrideRequests?.memory || defaultProjectMemoryRequest;

    const finalHelmValues: Prisma.JsonObject = {
      replicaCount:
        helmValueOverrides?.replicaCount ?? defaultProjectReplicaCount,
      containerPort:
        helmValueOverrides?.containerPort ?? defaultProjectContainerPort,
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
          finalHelmValues[key] = helmValueOverrides[key] as Prisma.JsonValue;
        }
      }
    }

    const newVersion: Version = await prisma.$transaction(async (tx) => {
      const createdHelmValues: HelmValues = await tx.helmValues.create({
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
        data: {
          versionId: versionData.id,
          status: AnalysisStatus.pending,
        },
      });

      return versionData;
    });

    console.log(
      `(최소 기능 시뮬레이션) CI/CD 파이프라인 트리거됨 for Version ID: ${newVersion.id}`
    );

    return res.status(201).json({
      message: '요청 성공 (최소 기능)',
      versionId: newVersion.id,
      versionName: newVersion.name,
    });
  } catch (error: unknown) {
    console.error('오류 발생 (최소 기능):', error);
    let statusCode = 500;
    let publicErrorMessage = '서버 내부 오류가 발생했습니다.';
    let errorName = 'InternalServerError';

    const errorDetail: string | undefined =
      process.env.NODE_ENV === 'development'
        ? error instanceof Error
          ? error.stack
          : String(error)
        : undefined;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      publicErrorMessage = '데이터베이스 처리 중 오류가 발생했습니다.';
      errorName = `PrismaError_${error.code}`;
      if (error.code === 'P2025') {
        publicErrorMessage = `요청하신 프로젝트 '${projectName}'를 찾을 수 없습니다.`;
        statusCode = 404;
      } else if (error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target)
          ? error.meta.target.join(', ')
          : (error.meta?.target as string) || '알 수 없는 필드';
        publicErrorMessage = `고유해야 하는 값이 이미 존재합니다: ${target}`;
        statusCode = 409;
      }
    } else if (error instanceof Error) {
      errorName = error.name;
      publicErrorMessage =
        process.env.NODE_ENV === 'development'
          ? error.message
          : publicErrorMessage;
    }

    return res.status(statusCode).json({
      message: publicErrorMessage,
      error: errorName,
      detail: errorDetail,
    });
  }
}
