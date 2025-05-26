// src/pages/api/image-build/trigger.ts

import type { NextApiRequest, NextApiResponse } from 'next';

// 주석 처리된 PrismaClient는 아직 사용하지 않으므로 주석 처리
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  try {
    // 임시 하드코딩된 값
    const versionId = 'v1.0.1' // 예: 'v1.0.1'
    const ref = 'feature/my-test'
    const repo = 'https://github.com/GRPC-OK/Practice.git'
    const githubToken = process.env.PLATFORM_GITHUB_TOKEN
    const workflowId = 'image_build_and_scan.yaml'

    const response = await fetch(
      `https://api.github.com/repos/${repo.replace('https://github.com/', '').replace('.git', '')}/actions/workflows/${workflowId}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref,
          inputs: { versionId, repo, ref },
        }),
      }
    )

    if (response.ok) {
      res.status(200).json({ message: 'Workflow triggered' })
    } else {
      const error = await response.text()
      res.status(500).json({ error })
    }
  } catch (err) {
    console.error('[trigger.ts] Error:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}