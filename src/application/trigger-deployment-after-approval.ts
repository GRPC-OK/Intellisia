import prisma from '@/lib/prisma';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';
import { triggerDeploymentWorkflow } from '@/services/deployment-service/trigger-deployment-workflow';

export async function triggerDeploymentAfterApproval(versionId: number) {
  const version = await prisma.version.findUnique({
    where: { id: versionId },
    include: { project: true, helmValues: true },
  });

  if (!version) throw new Error('Version not found');
  if (version.approveStatus !== 'approved') throw new Error('Not approved');

  await updateVersionStatusSafely(versionId, {
    deployStatus: 'pending',
  });

  try {
    await triggerDeploymentWorkflow({
      versionId,
      projectName: version.project.name,
      imageTag: version.imageTag,
      domain: version.project.domain,
      helmValues: version.helmValues?.content,
    });
  } catch (err) {
    await updateVersionStatusSafely(versionId, {
      deployStatus: 'fail',
      flowStatus: 'fail',
    });
    throw err;
  }
}
