import prisma from '@/lib/prisma';
import { triggerSemgrepWorkflow } from '@/services/code-analysis-service/code-analysis-dispatcher';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';

export async function triggerCodeAnalysisFlow(versionId: number) {
  const version = await prisma.version.findUnique({
    where: { id: versionId },
    include: { project: true },
  });

  if (!version) throw new Error('Version not found');

  await updateVersionStatusSafely(versionId, {
    codeStatus: 'pending',
    flowStatus: 'pending',
  });

  await triggerSemgrepWorkflow({
    versionId,
    repoUrl: version.project.githubUrl,
    branch: version.branch,
  });
}
