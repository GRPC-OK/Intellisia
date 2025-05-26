import type { Project, Version, Prisma } from '@prisma/client';

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
  tx: Prisma.TransactionClient, // 수정된 부분
  project: Project,
  input: CreateVersionParams
): Promise<Version> {
  const { branch, helmValueOverrides } = input;

  const targetCommitSha = 'simulated-commit-sha-1234567';
  const cleanBranchName = branch.replace(/[^a-zA-Z0-9-]/g, '-');
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

  const createdHelmValues = await tx.helmValues.create({
    data: { content: finalHelmValues },
  });

  return await tx.version.create({
    data: {
      name: versionName,
      description: `"${branch}" 브랜치 실행 (최소 기능)`,
      isCurrent: false,
      imageTag: 'pending-build',
      branch,
      commitHash: targetCommitSha,
      applicationName: project.name,
      projectId: project.id,
      authorId: project.ownerId || 1,
      helmValuesId: createdHelmValues.id,
    },
  });
}
