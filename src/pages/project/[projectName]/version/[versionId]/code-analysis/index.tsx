'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import VersionHeader from '@/components/version/VersionHeader';
import CodeAnalysisViewer from '@/components/code-analysis/CodeAnalysisViewer';
import CodeAnalysisEmptyView from '@/components/code-analysis/CodeAnalysisEmptyView';
import CodeAnalysisErrorView from '@/components/code-analysis/CodeAnalysisErrorView';

interface AnalysisStatus {
  status: 'failed' | 'passed_with_issues' | 'passed' | 'pending' | 'none';
}

export default function CodeAnalysisPage() {
  const router = useRouter();
  const { versionId, projectName } = router.query;

  const [status, setStatus] = useState<AnalysisStatus['status'] | null>(null);
  const [sarifData, setSarifData] = useState<object | null>(null);
  const [logText, setLogText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!versionId || typeof versionId !== 'string') return;

    const fetchData = async () => {
      try {
        const statusRes = await fetch(
          `/api/versions/${versionId}/code-analysis/status`
        );
        if (!statusRes.ok) throw new Error('상태 조회 실패');
        const { status }: AnalysisStatus = await statusRes.json();

        if (status === 'pending' || status === 'none') {
          router.push(`/project/${projectName}/version/${versionId}`);
          return;
        }

        setStatus(status);

        if (status === 'failed') {
          const logRes = await fetch(
            `/api/versions/${versionId}/code-analysis/log`
          );
          const log = await logRes.text();
          setLogText(log);
        }

        if (status === 'passed_with_issues') {
          const sarifRes = await fetch(
            `/api/versions/${versionId}/code-analysis/sarif`
          );
          if (!sarifRes.ok) throw new Error('SARIF 불러오기 실패');
          const sarifJson = await sarifRes.json();
          setSarifData(sarifJson);
        }

        if (status === 'passed') {
          const sarifRes = await fetch(
            `/api/versions/${versionId}/code-analysis/sarif`
          );
          const sarifJson = await sarifRes.json();
          if (sarifJson.runs && sarifJson.runs.length > 0) {
            setSarifData(sarifJson);
            setStatus('passed_with_issues');
          }
        }
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

        {!loading && status === 'passed' && <CodeAnalysisEmptyView />}
      </div>
    </>
  );
}
