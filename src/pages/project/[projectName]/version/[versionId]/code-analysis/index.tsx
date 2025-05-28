'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import VersionHeader from '@/components/version/VersionHeader';
import CodeAnalysisViewer from '@/components/code-analysis/CodeAnalysisViewer';
import CodeAnalysisEmptyView from '@/components/code-analysis/CodeAnalysisEmptyView';
import CodeAnalysisErrorView from '@/components/code-analysis/CodeAnalysisErrorView';

type AnalysisStatus =
  | 'failed'
  | 'passed_with_issues'
  | 'passed_no_issues'
  | 'pending'
  | 'none';

export default function CodeAnalysisPage() {
  const router = useRouter();
  const { versionId, projectName } = router.query;

  const [status, setStatus] = useState<AnalysisStatus | null>(null);
  const [sarifData, setSarifData] = useState<object | null>(null);
  const [logText, setLogText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!versionId || typeof versionId !== 'string') return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/versions/${versionId}/code-analysis/result`
        );
        if (!res.ok) throw new Error('분석 결과 요청 실패');

        const data: {
          status: AnalysisStatus;
          sarif?: object;
          logText?: string;
        } = await res.json();

        const { status, sarif, logText } = data;

        if (status === 'pending' || status === 'none') {
          router.push(`/project/${projectName}/version/${versionId}`);
          return;
        }

        setStatus(status);
        setSarifData(sarif ?? null);
        setLogText(logText ?? null);
      } catch (err) {
        console.error('분석 결과 처리 중 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [versionId, projectName, router]);

  return (
    <>
      <Head>
        <title>정적 분석 결과</title>
      </Head>

      <div className="bg-[#0d1117] min-h-screen px-4 sm:px-6 py-8 max-w-7xl mx-auto text-white">
        <VersionHeader />

        <h1 className="text-xl font-bold mb-4">정적 분석 결과</h1>
        <p className="text-sm text-gray-400 mb-8">
          자동으로 분석 결과를 확인하고 표시합니다.
        </p>

        {loading && <p className="text-gray-400">로딩 중...</p>}

        {!loading && status === 'failed' && logText && (
          <CodeAnalysisErrorView logText={logText} />
        )}

        {!loading && status === 'passed_with_issues' && sarifData && (
          <CodeAnalysisViewer sarif={sarifData} />
        )}

        {!loading && status === 'passed_no_issues' && <CodeAnalysisEmptyView />}
      </div>
    </>
  );
}
