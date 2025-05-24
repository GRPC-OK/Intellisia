import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// FIXME: 실제 GitHub 사용자/조직 이름과 레포지토리 이름을 설정하거나, Project 모델에서 가져오도록 수정해야 합니다.
const GITHUB_OWNER_FALLBACK = process.env.GITHUB_OWNER || 'your-github-owner';
const GITHUB_REPO_FALLBACK = process.env.GITHUB_REPO || 'your-github-repo';
const WORKFLOW_ID = 'trivy.yaml'; // The filename of the workflow
const GITHUB_API_VERSION = '2022-11-28'; // Recommended by GitHub

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { versionId, imageUri } = req.body;

  if (!versionId || !imageUri) {
    return res
      .status(400)
      .json({ message: 'Missing versionId or imageUri in request body' });
  }

  try {
    // 1. Update database: set status to pending
    const updatedVersion = await prisma.version.update({
      where: { id: parseInt(versionId as string, 10) },
      data: { imageStatus: 'pending' }, // Changed to imageStatus
      include: { project: true }, // project.githubUrl을 사용하기 위해 include
    });

    if (!updatedVersion) {
      return res
        .status(404)
        .json({ message: `Version with ID ${versionId} not found.` });
    }

    let owner = GITHUB_OWNER_FALLBACK;
    let repo = GITHUB_REPO_FALLBACK;
    if (updatedVersion.project?.githubUrl) {
      try {
        const url = new URL(updatedVersion.project.githubUrl);
        const pathParts = url.pathname
          .split('/')
          .filter((part) => part.length > 0);
        if (pathParts.length >= 2) {
          owner = pathParts[0];
          repo = pathParts[1].replace(/\.git$/, ''); // Remove .git suffix if present
        }
      } catch (e) {
        console.error(
          'Failed to parse githubUrl:',
          updatedVersion.project.githubUrl,
          e
        );
        // Fallback values will be used
      }
    }

    // 2. Trigger GitHub Action workflow
    const backendCallbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/image-analysis/callback`;

    console.log(
      `Triggering workflow for versionId: ${versionId}, imageUri: ${imageUri}, owner: ${owner}, repo: ${repo}, ref: ${updatedVersion.branch}`
    );
    console.log(`Callback URL will be: ${backendCallbackUrl}`);

    const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${WORKFLOW_ID}/dispatches`;

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error('GITHUB_TOKEN is not set. Cannot dispatch workflow.');
      // Optionally, revert prisma status update or return a specific error
      return res
        .status(500)
        .json({ message: 'Server configuration error: GITHUB_TOKEN missing.' });
    }

    const response = await fetch(dispatchUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${githubToken}`,
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: updatedVersion.branch,
        inputs: {
          versionId: versionId.toString(),
          imageUri,
          callbackUrl: backendCallbackUrl,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      console.error(`GitHub API Error (${response.status}):`, errorData);
      // Attempt to revert the status? Or let a cleanup job handle it.
      // For now, just return the error.
      return res.status(response.status || 500).json({
        message: `GitHub API Error: ${errorData.message || response.statusText}`,
      });
    }

    console.log(
      `Workflow dispatch successful for versionId: ${versionId}. Response status: ${response.status}`
    );

    return res.status(200).json({
      message: 'Image analysis workflow triggered successfully.',
      versionId,
      imageStatus: 'pending', // Changed to imageStatus
    });
  } catch (error) {
    console.error('Error triggering image analysis workflow:', error);
    // General error handling
    // Check if error is a Prisma error or other type if more specific handling is needed
    let errorMessage = 'Internal Server Error while triggering workflow';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return res.status(500).json({ message: errorMessage });
  }
}
