import prisma from '@/lib/prisma';
import { updateVersionStatusSafelyWithTx } from '@/services/version-service/version-status-updater-with-tx.service';

export async function triggerImageWorkflow({
  versionId,
  repoUrl,
  branch,
}: {
  versionId: number;
  repoUrl: string;
  branch: string;
}) {
  // 1. GitHub 레포 경로 분리 및 .git 제거
  const [owner, rawRepo] = new URL(repoUrl).pathname.slice(1).split('/');
  const repo = rawRepo.replace(/\.git$/, '');

  // 2. 환경 변수로부터 플랫폼 워크플로우 정보 불러오기
  const PLATFORM_WORKFLOW_OWNER = process.env.WORKFLOW_REPO_OWNER!;
  const PLATFORM_WORKFLOW_REPO = process.env.WORKFLOW_REPO_NAME!;
  const PLATFORM_WORKFLOW_REF = process.env.WORKFLOW_REF!;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

  try {
    // 3. GitHub Actions 워크플로우 dispatch
    const res = await fetch(
      `https://api.github.com/repos/${PLATFORM_WORKFLOW_OWNER}/${PLATFORM_WORKFLOW_REPO}/actions/workflows/image_build_and_scan.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({
          ref: PLATFORM_WORKFLOW_REF,
          inputs: {
            versionId: versionId.toString(),
            repo: `${owner}/${repo}`,
            ref: branch,
            baseUrl: BASE_URL,
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error('[Image Build 트리거 실패]', err);

    // 4. 실패 시 DB에 상태 반영
    await prisma.$transaction(async (tx) => {
      await updateVersionStatusSafelyWithTx(tx, versionId, {
        imageStatus: 'fail',
        flowStatus: 'fail',
      });
    });

    throw new Error('GitHub Actions 트리거 실패: ' + String(err));
  }
}
