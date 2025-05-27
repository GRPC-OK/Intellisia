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
  const pathParts = new URL(repoUrl).pathname.slice(1).split('/');
  const owner = pathParts[0];
  const repo = pathParts[1].replace(/\.git$/, '');

  const PLATFORM_WORKFLOW_OWNER = process.env.WORKFLOW_REPO_OWNER!;
  const PLATFORM_WORKFLOW_REPO = process.env.WORKFLOW_REPO_NAME!;
  const PLATFORM_WORKFLOW_REF = process.env.WORKFLOW_REF!;

  try {
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
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error('[Image Build 트리거 실패]', err);

    await prisma.$transaction(async (tx) => {
      await updateVersionStatusSafelyWithTx(tx, versionId, {
        imageStatus: 'fail',
        flowStatus: 'fail',
      });
    });

    throw new Error('GitHub Actions 트리거 실패: ' + String(err));
  }
}
