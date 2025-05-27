export async function triggerImageWorkflow({
  versionId,
  repoUrl,
  branch,
}: {
  versionId: number;
  repoUrl: string;
  branch: string;
}) {
  const pathParts = new URL(repoUrl).pathname.slice(1).split('/');
  const owner = pathParts[0]; // 첫 번째 요소가 owner
  const repo = pathParts[1].replace(/\.git$/, ''); // 두 번째 요소에서 .git 제거
  //const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/versions/${versionId}/image-build`;

  const PLATFORM_WORKFLOW_OWNER = process.env.WORKFLOW_REPO_OWNER!;
  const PLATFORM_WORKFLOW_REPO = process.env.WORKFLOW_REPO_NAME!;
  const PLATFORM_WORKFLOW_REF = process.env.WORKFLOW_REF!;

  const res = await fetch(
    `https://api.github.com/repos/${PLATFORM_WORKFLOW_OWNER}/${PLATFORM_WORKFLOW_REPO}/actions/workflows/image_build_and_scan.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({
        ref: PLATFORM_WORKFLOW_REF,
        inputs: {
          versionId: versionId.toString(),
          repo: `${owner}/${repo}`,
          ref: branch,
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub Actions 트리거 실패: ${res.status} ${text}`);
  }
}
