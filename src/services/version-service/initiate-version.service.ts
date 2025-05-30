import type { Project, Version, Prisma } from '@prisma/client';
import { createVersionWithAutoName } from '@/services/version-service/processor/version-generator';

interface HelmResourcesRequests {
  cpu?: string;
  memory?: string;
}

interface HelmResources {
  requests?: HelmResourcesRequests;
}

interface HelmValueOverrides {
  replicaCount?: number;
  port?: number;
  resources?: HelmResources;
  [key: string]: unknown;
}

export interface CreateVersionParams {
  branch: string;
  helmValueOverrides?: HelmValueOverrides;
}

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

function getJsonValue<T>(
  obj: Prisma.JsonValue | null | undefined,
  path: string[],
  defaultValue: T
): T {
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
}

export async function initiateVersionInsideTx(
  tx: Prisma.TransactionClient,
  project: Project,
  input: CreateVersionParams
): Promise<Version> {
  const { branch, helmValueOverrides } = input;

  const targetCommitSha = 'simulated-commit-sha-1234567';

  const defaultHelm = project.defaultHelmValues;
  const overrideRequests = helmValueOverrides?.resources?.requests;

  const defaultProjectReplicaCount =
    getJsonValue<number | undefined>(
      defaultHelm,
      ['replicaCount'],
      undefined
    ) ?? 1;
  const defaultProjectPort =
    getJsonValue<number | undefined>(defaultHelm, ['port'], undefined) ?? 8080;
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
    port: helmValueOverrides?.port ?? defaultProjectPort,
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
      if (!['replicaCount', 'port', 'resources'].includes(key)) {
        finalHelmValues[key] = helmValueOverrides[key] as Prisma.JsonValue;
      }
    }
  }

  const createdHelmValues = await tx.helmValues.create({
    data: { content: finalHelmValues },
  });

  return await createVersionWithAutoName(tx, project.id, {
    // 기존: `"${branch}" 브랜치 실행 (최소 기능)`
    // 개선: 사용자 친화적인 설명
    description: `${branch} 브랜치에서 배포된 버전입니다`,
    isCurrent: false,
    // 기존: 'pending-build'
    // 개선: 더 자연스러운 표현
    imageTag: 'v-building',
    branch,
    commitHash: targetCommitSha,
    project: { connect: { id: project.id } },
    author: { connect: { id: project.ownerId || 1 } },
    helmValues: { connect: { id: createdHelmValues.id } },
  });
}
