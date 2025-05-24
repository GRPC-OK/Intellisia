import prisma from '@/lib/prisma';
import { triggerSemgrepWorkflow } from '@/services/code-analysis-service/trigger-semgrep-workflow';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';

export async function startCodeAnalysis(versionId: number) {
  const version = await prisma.version.findUnique({
    where: { id: versionId },
    include: { project: true },
  });

  if (!version) throw new Error('Version not found');

  // 상태 업데이트
  await updateVersionStatusSafely(versionId, {
    codeStatus: 'pending',
    flowStatus: 'pending',
  });

  await prisma.codeAnalysis.upsert({
    where: { versionId },
    update: { status: 'pending' },
    create: { versionId, status: 'pending' },
  });

  // 워크플로우 트리거
  await triggerSemgrepWorkflow({
    versionId,
    repoUrl: version.project.githubUrl,
    branch: version.branch,
  });
}
