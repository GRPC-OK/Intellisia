// src/services/deployment-service/trigger-deployment-workflow.ts
import { Prisma } from '@prisma/client';

interface DeploymentParams {
  versionId: number;
  projectName: string;
  imageTag: string;
  domain: string;
  helmValues?: Prisma.JsonValue;
}

export async function triggerDeploymentWorkflow({
  versionId,
  projectName,
  imageTag,
  domain,
  helmValues,
}: DeploymentParams) {
  const PLATFORM_WORKFLOW_OWNER = process.env.WORKFLOW_REPO_OWNER!;
  const PLATFORM_WORKFLOW_REPO = process.env.WORKFLOW_REPO_NAME!;
  const PLATFORM_WORKFLOW_REF = process.env.WORKFLOW_REF!;

  // GitHub Actions의 deploy.yml 워크플로우 트리거
  const res = await fetch(
    `https://api.github.com/repos/${PLATFORM_WORKFLOW_OWNER}/${PLATFORM_WORKFLOW_REPO}/actions/workflows/deploy.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ENV}`,
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({
        ref: PLATFORM_WORKFLOW_REF,
        inputs: {
          versionId: versionId.toString(),
          projectName,
          imageTag,
          domain,
          // Helm values를 JSON 문자열로 전달
          helmValues: helmValues ? JSON.stringify(helmValues) : '{}',
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`배포 워크플로우 트리거 실패: ${res.status} ${text}`);
  }

  console.log(`[SUCCESS] 배포 워크플로우 트리거 완료: versionId=${versionId}, project=${projectName}`);
}