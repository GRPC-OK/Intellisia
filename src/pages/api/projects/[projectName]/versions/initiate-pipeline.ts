import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, StepStatus, AnalysisStatus, FlowStatus, Prisma, Project, Version, HelmValues } from '@prisma/client'; // 구체적인 타입 임포트

const prisma = new PrismaClient();

// RequestBody의 helmValueOverrides 내부 타입을 좀 더 명확히 정의
interface HelmResourcesRequests {
  cpu?: string;
  memory?: string;
}

interface HelmResources {
  requests?: HelmResourcesRequests;
  // limits는 백엔드에서 생성하므로 RequestBody에 포함하지 않음
}

interface HelmValueOverrides {
  replicaCount?: number;
  containerPort?: number;
  resources?: HelmResources;
  [key: string]: unknown; // 다른 추가적인 값들은 여전히 허용하되, any 대신 unknown 사용
}

interface RequestBody {
  branch: string;
  applicationName: string;
  dockerfilePath: string;
  helmValueOverrides?: HelmValueOverrides; // 수정된 타입 사용
}

// ApiResponse 타입은 유지
type ApiResponse = {
  message: string;
  versionId?: number;
  versionName?: string;
  error?: string;
  detail?: string; // 개발 환경용 상세 에러 (문자열로 통일)
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
  console.log('Request received. Method:', req.method, 'Query:', req.query);
  console.log('Request body:', req.body);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `메서드 ${req.method}는 허용되지 않습니다.` });
  }

  const { projectName } = req.query as { projectName?: string };

  try {
    if (!projectName) {
      return res.status(400).json({ message: 'URL 경로에 Project 이름이 필요합니다.' });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: '요청 본문(body)이 비어 있습니다.' });
    }

    // req.body 타입을 RequestBody로 명시적 단언 (필요시 추가 검증 로직)
    const {
      branch: requestedBranchName,
      applicationName,
      dockerfilePath,
      helmValueOverrides,
    }: RequestBody = req.body as RequestBody;

    if (!requestedBranchName || !applicationName || !dockerfilePath) {
      return res.status(400).json({ message: '필수 입력값이 누락되었습니다 (branch, applicationName, dockerfilePath).' });
    }

    const project: Project | null = await prisma.project.findUnique({ // 타입 명시
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

    // 타입 안정성을 위해 기본값 가져올 때 주의
    const getJsonValue = <T>(obj: Prisma.JsonValue | null | undefined, path: string[], defaultValue: T): T => {
        let current: any = obj;
        for (const key of path) {
            if (current === null || typeof current !== 'object' || !current.hasOwnProperty(key)) {
                return defaultValue;
            }
            current = current[key];
        }
        return typeof current === typeof defaultValue ? current : defaultValue;
    };

    const defaultProjectReplicaCount = getJsonValue(defaultHelm, ['replicaCount'], 1);
    const defaultProjectContainerPort = getJsonValue(defaultHelm, ['containerPort'], 8080);
    const defaultProjectCpuRequest = getJsonValue(defaultHelm, ['resources', 'requests', 'cpu'], "100m");
    const defaultProjectMemoryRequest = getJsonValue(defaultHelm, ['resources', 'requests', 'memory'], "128Mi");


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
            // `unknown` 타입으로 인해 직접 할당 전 타입 체크 또는 단언 필요할 수 있음
            if (!['replicaCount', 'containerPort', 'resources'].includes(key)) {
                finalHelmValues[key] = helmValueOverrides[key] as Prisma.JsonValue;
            }
        }
    }

    const newVersion: Version = await prisma.$transaction(async (tx) => { // 타입 명시
      const createdHelmValues: HelmValues = await tx.helmValues.create({ // 타입 명시
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

  } catch (error: unknown) { // Line 188: error 타입을 unknown으로 변경
    console.error("오류 발생 (최소 기능):", error);
    let statusCode = 500;
    let publicErrorMessage = "서버 내부 오류가 발생했습니다.";
    let errorName = "InternalServerError";
    let errorDetail: string | undefined;


    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      publicErrorMessage = "데이터베이스 처리 중 오류가 발생했습니다.";
      errorName = `PrismaError_${error.code}`;
      if (error.code === 'P2025') {
          publicErrorMessage = `요청하신 프로젝트 '${projectName}'를 찾을 수 없습니다.`;
          statusCode = 404;
      } else if (error.code === 'P2002') {
          const target = Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : error.meta?.target as string || '알 수 없는 필드';
          publicErrorMessage = `고유해야 하는 값이 이미 존재합니다: ${target}`;
          statusCode = 409;
      }
    } else if (error instanceof Error) { // 일반 Error 객체 처리
        errorName = error.name;
        // 개발 환경에서만 실제 에러 메시지 포함
        publicErrorMessage = process.env.NODE_ENV === 'development' ? error.message : publicErrorMessage;
    }
    
    // detail은 항상 문자열로 통일 (개발 환경에서만)
    errorDetail = process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined;


    return res.status(statusCode).json({
      message: publicErrorMessage,
      error: errorName, // 에러 이름 또는 코드 전달
      detail: errorDetail,
    });
  }
}