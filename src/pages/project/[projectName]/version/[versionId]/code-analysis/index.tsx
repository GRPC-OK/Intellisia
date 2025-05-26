'use client';

import Head from 'next/head';
import VersionHeader from '@/components/version/VersionHeader';
import CodeAnalysisViewer from '@/components/code-analysis/CodeAnalysisViewer';

export default function CodeAnalysisPage() {
  const loading = false as const;

  return (
    <>
      <Head>
        <title>정적 분석 테스트</title>
      </Head>

      <div className="bg-[#0d1117] min-h-screen px-4 sm:px-6 py-8 max-w-7xl mx-auto text-white">
        <VersionHeader />

        <h1 className="text-xl font-bold mb-4">정적 분석 결과 테스트 페이지</h1>
        <p className="text-sm text-gray-400 mb-8">
          이 페이지는 현재 정적 분석 결과 뷰어를 테스트하기 위한 임시
          화면입니다.
        </p>

        {loading && <p>로딩 중...</p>}

        {!loading && <CodeAnalysisViewer />}

        {/* 필요 시 빈 뷰도 테스트 가능 */}
        {/* {!loading && <CodeAnalysisEmptyView />} */}
      </div>
    </>
  );
}
