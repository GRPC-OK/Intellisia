import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { versionName, projectId, callbackUrl, repo, ref } = req.body;

  const githubToken = process.env.PLATFORM_GITHUB_TOKEN; // 환경변수에 저장 필요
  const workflowId = 'image_build.yml'; // 워크플로우 파일명

  const response = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/${workflowId}/dispatches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref,
        inputs: { versionName, callbackUrl, repo, ref, projectId }
      }),
    }
  );

  if (response.ok) {
    res.status(200).json({ message: 'Workflow triggered' });
  } else {
    const error = await response.text();
    res.status(500).json({ error });
  }
}
