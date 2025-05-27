import prisma from '@/lib/prisma';
import { initiateVersionInsideTx } from '@/services/version-service/initiate-version.service';
import { updateVersionStatusSafelyWithTx } from '@/services/version-service/version-status-updater-with-tx.service';
import { triggerSemgrepWorkflow } from '@/services/code-analysis-service/trigger-semgrep-workflow';
import { triggerImageWorkflow } from '@/pages/api/image-build/trigger-image-workflow';
import type { CreateVersionParams } from '@/services/version-service/initiate-version.service';
import { AnalysisStatus } from '@prisma/client';

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
    `[INFO] GitHub Actions 트리거 시도 중: versionId=${version.id}, branch=${version.branch}`
  );

  try {
    await triggerSemgrepWorkflow({
      versionId: version.id,
      repoUrl: project.githubUrl,
      branch: version.branch,
    });
    console.log(
      `[SUCCESS] GitHub Actions 트리거 완료: versionId=${version.id}`
    );
  } catch (err) {
    console.error('Semgrep 트리거 실패:', err);

    await prisma.$transaction(async (tx) => {
      await updateVersionStatusSafelyWithTx(tx, version.id, {
        codeStatus: 'fail',
        flowStatus: 'fail',
      });

      await tx.codeAnalysis.update({
        where: { versionId: version.id },
        data: {
          status: AnalysisStatus.failed,
          errorLogUrl: 'Trigger failed: ' + String(err),
        },
      });
    });

    throw new Error('GitHub Actions 트리거 실패: ' + String(err));
  }

  try {
    await triggerImageWorkflow({
      versionId: version.id,
      repoUrl: project.githubUrl,
      branch: version.branch,
    });
    console.log(
      `[SUCCESS] GitHub Actions 트리거 완료: versionId=${version.id}`
    );
  } catch (err) {
    console.error('Semgrep 트리거 실패:', err);

    await prisma.$transaction(async (tx) => {
      await updateVersionStatusSafelyWithTx(tx, version.id, {
        imageStatus: 'fail',
        flowStatus: 'fail',
      });

      await tx.codeAnalysis.update({
        where: { versionId: version.id },
        data: {
          status: AnalysisStatus.failed,
          errorLogUrl: 'Trigger failed: ' + String(err),
        },
      });
    });

    throw new Error('GitHub Actions 트리거 실패: ' + String(err));
  }

  return version;
}
