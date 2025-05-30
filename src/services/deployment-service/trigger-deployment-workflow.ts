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
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

  const callbackUrl = `${BASE_URL}/api/versions/${versionId}/deployment`;

  const url = `https://api.github.com/repos/${PLATFORM_WORKFLOW_OWNER}/${PLATFORM_WORKFLOW_REPO}/actions/workflows/deploy.yml/dispatches`;

  const payload = {
    ref: PLATFORM_WORKFLOW_REF,
    inputs: {
      versionId: versionId.toString(),
      projectName,
      imageTag,
      domain,
      callbackUrl,
      helmValues: helmValues ? JSON.stringify(helmValues) : '{}',
    },
  };

  console.log('🚀 [triggerDeploymentWorkflow] 트리거 시작');
  console.log('🌐 요청 URL:', url);
  console.log('📦 요청 payload:', JSON.stringify(payload, null, 2));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log('📥 응답 status:', res.status);
  console.log('📥 응답 body:', text);

  if (!res.ok) {
    throw new Error(`배포 워크플로우 트리거 실패: ${res.status} ${text}`);
  }

  console.log(
    `[✅ SUCCESS] 배포 워크플로우 트리거 완료: versionId=${versionId}, project=${projectName}`
  );
}
