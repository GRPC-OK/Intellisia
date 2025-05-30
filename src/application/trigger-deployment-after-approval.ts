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
    flowStatus: 'pending',
  });

  try {
    const IMAGE_REPO = process.env.DOCKER_REPO;
    if (!IMAGE_REPO)
      throw new Error('DOCKER_REPO 환경변수가 설정되지 않았습니다');

    const mergedHelmValues = {
      ...((version.helmValues?.content ?? {}) as Record<string, unknown>),
      image: {
        repository: IMAGE_REPO,
        tag: version.imageTag,
        pullPolicy: 'IfNotPresent',
      },
      host: `${version.project.name}.intellisia.site`,
    };

    await triggerDeploymentWorkflow({
      versionId,
      projectName: version.project.name,
      imageTag: version.imageTag,
      domain: version.project.domain,
      helmValues: mergedHelmValues,
    });
  } catch (err) {
    await updateVersionStatusSafely(versionId, {
      deployStatus: 'fail',
      flowStatus: 'fail',
    });
    throw err;
  }
}
