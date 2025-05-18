export async function triggerSemgrepWorkflow({
  versionId,
  repoUrl,
  branch,
}: {
  versionId: number;
  repoUrl: string;
  branch: string;
}) {
  const [owner, repo] = new URL(repoUrl).pathname.slice(1).split('/');
  const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/versions/${versionId}/code-analysis`;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/semgrep.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({
        ref: 'hyewon/code-analysis-backend',
        inputs: {
          versionId: versionId.toString(),
          callbackUrl,
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
