import type { NextApiRequest, NextApiResponse } from 'next';
import { startFullFlow } from '@/application/code-analysis/start-full-flow';
import type { CreateVersionParams } from '@/services/version-service/initiate-version.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { projectName } = req.query as { projectName?: string };
  if (!projectName) {
    return res.status(400).json({ message: 'Missing projectName' });
  }

  try {
    const { branch, helmValueOverrides } = req.body as CreateVersionParams;

    if (!branch) {
      return res.status(400).json({ message: 'branch는 필수입니다.' });
    }

    const version = await startFullFlow(projectName, {
      branch,
      helmValueOverrides,
    });

    return res.status(200).json({
      message: '버전 생성 및 정적 분석 트리거 완료',
      versionId: version.id,
      versionName: version.name,
    });
  } catch (error) {
    console.error('[START FLOW ERROR]', error);
    return res.status(500).json({
      message: '전체 흐름 실패',
      error: String(error),
    });
  }
}
