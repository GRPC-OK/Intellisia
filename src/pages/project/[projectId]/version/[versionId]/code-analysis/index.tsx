'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import ProjectHeader from '@/components/project-detail/ProjectHeader';
import CodeAnalysisStatusView from '@/components/code-analysis/CodeAnalysisStatusView';
import type { CodeIssue, CodeAnalysisResult } from '@/types/code-analysis';

export default function CodeAnalysisPage() {
  const router = useRouter();
  const { projectId, versionId } = router.query;

  const [versionName, setVersionName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [hasIssue, setHasIssue] = useState(false);
  const [status, setStatus] = useState<'success' | 'fail'>('success');
  const [errorLog, setErrorLog] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId || !versionId) return;

    const fetchData = async () => {
      try {
        const versionRes = await fetch(`/api/versions/${versionId}`);
        const versionData = await versionRes.json();

        setVersionName(versionData.name);
        setProjectName(versionData.project.name);
        setOwnerName(versionData.project.owner.name);

        // codeStatus가 pending 또는 none이면 리다이렉트
        if (
          versionData.codeStatus === 'pending' ||
          versionData.codeStatus === 'none'
        ) {
          router.replace(`/projects/${projectId}`);
          return;
        }

        const analysisRes = await fetch(
          `/api/versions/${versionId}/code-analysis`
        );
        const analysisData: CodeAnalysisResult = await analysisRes.json();

        if (
          analysisData.status === 'success' ||
          analysisData.status === 'fail'
        ) {
          setStatus(analysisData.status);
        }

        setHasIssue(analysisData.hasIssue ?? false);
        setIssues(analysisData.issues ?? []);
        setErrorLog(analysisData.errorLog ?? null);
      } catch (error) {
        console.error('데이터 불러오기 실패:', error);
      }
    };

    fetchData();
  }, [projectId, versionId, router]);

  const handleIssueClick = (issue: CodeIssue) => {
    router.push(
      `/project/${projectId}/version/${versionId}/code-analysis/${issue.id}`
    );
  };

  return (
    <>
      <Head>
        <title>{`${projectName} - 정적 분석`}</title>
      </Head>

      <div className="bg-[#0d1117] min-h-screen px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        <ProjectHeader
          projectName={`${projectName} / v${versionName}`}
          creatorName={ownerName}
        />
        <CodeAnalysisStatusView
          status={status}
          hasIssue={hasIssue}
          errorLog={errorLog}
          issues={issues}
          onIssueClick={handleIssueClick}
        />
      </div>
    </>
  );
}
