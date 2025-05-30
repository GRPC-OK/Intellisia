import { NextApiRequest, NextApiResponse } from 'next';
import { triggerDeploymentAfterApproval } from '@/application/trigger-deployment-after-approval';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const versionId = Number(req.query.versionId);
  if (isNaN(versionId)) {
    return res.status(400).json({ message: 'Invalid versionId' });
  }

  try {
    await triggerDeploymentAfterApproval(versionId);
    return res.status(200).json({ message: 'Retry triggered' });
  } catch (err) {
    console.error('[RETRY DEPLOY ERROR]', err);
    return res
      .status(500)
      .json({ message: 'Retry failed', error: String(err) });
  }
}
