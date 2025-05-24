'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import VersionHeader from '@/components/version/VersionHeader';
import CodeAnalysisStatusView from '@/components/code-analysis/CodeAnalysisStatusView';
import type { CodeIssue, CodeAnalysisResult } from '@/types/code-analysis';

export default function CodeAnalysisPage() {
  const router = useRouter();
  const { projectName, versionId } = router.query;

  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [hasIssue, setHasIssue] = useState(false);
  const [status, setStatus] = useState<'success' | 'fail'>('success');
  const [errorLog, setErrorLog] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || typeof versionId !== 'string') return;

    const redirectToProject = () => {
      if (typeof projectName === 'string') {
        router.replace(`/project/${projectName}`);
      }
    };

    const fetchData = async () => {
      try {
        const versionData = await fetch(`/api/versions/${versionId}`).then(
          (res) => res.json()
        );

        if (
          versionData.codeStatus === 'pending' ||
          versionData.codeStatus === 'none'
        ) {
          redirectToProject();
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
  }, [router, versionId, projectName]);

  const handleIssueClick = (issue: CodeIssue) => {
    if (typeof projectName === 'string' && typeof versionId === 'string') {
      router.push(
        `/project/${projectName}/version/${versionId}/code-analysis/${issue.id}`
      );
    }
  };

  return (
    <>
      <Head>
        <title>{`${projectName} - 정적 분석`}</title>
      </Head>

      <div className="bg-[#0d1117] min-h-screen px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        <VersionHeader /> {/* ✅ 이 줄만 삽입 */}
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
