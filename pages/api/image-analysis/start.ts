import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Octokit } from '@octokit/rest';

const prisma = new PrismaClient();
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN }); // Ensure GITHUB_TOKEN is set in .env

// FIXME: 실제 GitHub 사용자/조직 이름과 레포지토리 이름을 설정하거나, Project 모델에서 가져오도록 수정해야 합니다.
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'your-github-owner'; 
const GITHUB_REPO = process.env.GITHUB_REPO || 'your-github-repo';
const WORKFLOW_ID = 'image-analysis.yaml'; // The filename of the workflow

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { versionId, imageUri } = req.body;

  if (!versionId || !imageUri) {
    return res.status(400).json({ message: 'Missing versionId or imageUri in request body' });
  }

  try {
    // 1. Update database: set status to pending
    const updatedVersion = await prisma.version.update({
      where: { id: parseInt(versionId as string, 10) },
      data: { imageAnalysisStatus: 'pending' },
      include: { project: true } // project.githubUrl을 사용하기 위해 include
    });

    if (!updatedVersion) {
      return res.status(404).json({ message: `Version with ID ${versionId} not found.` });
    }
    
    // GitHub URL에서 owner와 repo 추출 (예: "https://github.com/owner/repo")
    // 실제 githubUrl 형식에 따라 파싱 로직을 견고하게 만들어야 합니다.
    let owner = GITHUB_OWNER;
    let repo = GITHUB_REPO;
    if (updatedVersion.project?.githubUrl) {
        try {
            const url = new URL(updatedVersion.project.githubUrl);
            const pathParts = url.pathname.split('/').filter(part => part.length > 0);
            if (pathParts.length >= 2) {
                owner = pathParts[0];
                repo = pathParts[1];
            }
        } catch (e) {
            console.error("Failed to parse githubUrl:", updatedVersion.project.githubUrl, e);
            // 기본값 사용 또는 에러 처리
        }
    }


    // 2. Trigger GitHub Action workflow
    //    Construct the callback URL (ensure this is your actual deployed backend URL)
    const backendCallbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/image-analysis/callback`;
    
    console.log(`Triggering workflow for versionId: ${versionId}, imageUri: ${imageUri}, owner: ${owner}, repo: ${repo}, ref: ${updatedVersion.branch}`);
    console.log(`Callback URL will be: ${backendCallbackUrl}`);


    await octokit.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: WORKFLOW_ID,
      ref: updatedVersion.branch, // Use branch from the version model
      inputs: {
        versionId: versionId.toString(),
        imageUri,
        callbackUrl: backendCallbackUrl,
        // repo: `${owner}/${repo}`, // 워크플로우에서 필요하다면 전달
        // ref: updatedVersion.branch // 워크플로우에서 필요하다면 전달
      },
    });

    return res.status(200).json({ 
        message: 'Image analysis workflow triggered successfully.', 
        versionId,
        imageAnalysisStatus: 'pending' 
    });

  } catch (error) {
    console.error('Error triggering image analysis workflow:', error);
    // If prisma update failed, attempt to revert status or handle error
    // If Octokit failed, the status is already 'pending', which might need cleanup later.
    // It might be better to trigger workflow first, then update status to pending only on successful trigger.
    // For now, simple error reporting:
    
    // Check if the error is from Octokit (e.g., GitHub API error)
    if (error.status && error.message) {
        return res.status(error.status).json({ message: `GitHub API Error: ${error.message}` });
    }
    
    return res.status(500).json({ message: 'Internal Server Error while triggering workflow' });
  }
}
