'use client';

import Script from 'next/script';
import Head from 'next/head';

import VersionHeader from '@/components/version/VersionHeader';
import CodeAnalysisViewer from '@/components/code-analysis/CodeAnalysisViewer';
import CodeAnalysisEmptyView from '@/components/code-analysis/CodeAnalysisEmptyView';

export default function CodeAnalysisPage() {
  const sarifUrl = '/full.sarif' as const; // public/full.sarif
  const loading = false as const;

  return (
    <>
      <Head>
        <title>정적 분석 테스트</title>
      </Head>

      <Script
        src="https://unpkg.com/sarif-web-component@0.1.14/dist/sarif-web-component.js"
        type="module"
        strategy="afterInteractive"
      />

      <div className="bg-[#0d1117] min-h-screen px-4 sm:px-6 py-8 max-w-7xl mx-auto text-white">
        <VersionHeader />

        {loading && <p>로딩 중...</p>}

        {!loading && sarifUrl && (
          <div className="mt-6">
            <p className="text-sm text-gray-400 mb-2">
              파일: <span className="font-mono text-white">{sarifUrl}</span>
            </p>
            <CodeAnalysisViewer sarifUrl={sarifUrl} />
          </div>
        )}

        {!loading && !sarifUrl && <CodeAnalysisEmptyView />}
      </div>
    </>
  );
}
