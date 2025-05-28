import prisma from '@/lib/prisma';
import { initiateVersionInsideTx } from '@/services/version-service/initiate-version.service';
import { updateVersionStatusSafelyWithTx } from '@/services/version-service/version-status-updater-with-tx.service';
import { triggerSemgrepWorkflow } from '@/services/code-analysis-service/trigger-semgrep-workflow';
import { triggerImageWorkflow } from '@/pages/api/versions/[versionId]/image-build/trigger-image-workflow';
import type { CreateVersionParams } from '@/services/version-service/initiate-version.service';

export async function startFullFlow(
  projectName: string,
  input: CreateVersionParams
) {
  const project = await prisma.project.findUnique({
    where: { name: projectName },
  });
  if (!project) throw new Error('Project not found');

  const version = await prisma.$transaction(async (tx) => {
    const version = await initiateVersionInsideTx(tx, project, input);

    await updateVersionStatusSafelyWithTx(tx, version.id, {
      codeStatus: 'pending',
      buildStatus: 'pending',
      flowStatus: 'pending',
    });

    await tx.codeAnalysis.upsert({
      where: { versionId: version.id },
      update: { status: 'pending' },
      create: { versionId: version.id, status: 'pending' },
    });

    return version;
  });

  console.log(
    `[INFO] GitHub Actions 트리거 시작: versionId=${version.id}, branch=${version.branch}`
  );

  // 병렬로 트리거만 날리고 기다리지 않음
  triggerSemgrepWorkflow({
    versionId: version.id,
    repoUrl: project.githubUrl,
    branch: version.branch,
  }).catch((err) => {
    console.error('[ERROR] Semgrep 트리거 실패:', err);
  });

  triggerImageWorkflow({
    versionId: version.id,
    repoUrl: project.githubUrl,
    branch: version.branch,
  }).catch((err) => {
    console.error('[ERROR] 이미지 빌드 트리거 실패:', err);
  });

  return version;
}
