// src/pages/project/[projectName]/version/[versionId]/image-analysis/index.tsx
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import VersionHeader from '@/components/version/VersionHeader';

const Viewer = dynamic(
  () => import('@microsoft/sarif-web-component').then((mod) => mod.Viewer),
  { ssr: false }
);

interface ImageAnalysisData {
  version: {
    id: number;
    name: string;
    project: {
      name: string;
      owner: { name: string };
    };
  };
  sarifData?: object;
  status: 'pending' | 'success' | 'failed' | 'no_data';
  hasAnalysisResult: boolean;
  message?: string;
}

export default function ImageAnalysisPage() {
  const router = useRouter();
  const { versionId, projectName } = router.query;
  
  const [data, setData] = useState<ImageAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || typeof versionId !== 'string') return;

    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/versions/${versionId}/image-analysis`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const analysisData = await res.json();
        setData(analysisData);

        // 분석이 아직 진행중이면 플로우 페이지로 리다이렉트
        if (analysisData.status === 'pending') {
          setTimeout(() => {
            router.push(`/project/${projectName}/version/${versionId}`);
          }, 2000);
        }

      } catch (err) {
        console.error('Failed to fetch image analysis:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [router.isReady, versionId, projectName, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <VersionHeader />
          <div className="mt-8 text-center">
            <div className="text-lg">이미지 분석 결과를 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <VersionHeader />
          <div className="mt-8">
            <h1 className="text-3xl font-bold mb-4 text-red-400">에러 발생</h1>
            <div className="bg-red-950 text-red-200 p-4 rounded-lg">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Image Analysis Results</title>
      </Head>

      <div className="min-h-screen bg-[#0d1117] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <VersionHeader />
          
          <h1 className="text-3xl font-bold mb-2">Image Static Analysis Results</h1>
          
          {data?.status === 'pending' && (
            <div className="mt-6 bg-yellow-900 text-yellow-200 p-4 rounded-lg">
              <p>이미지 분석이 진행 중입니다. 잠시 후 플로우 페이지로 이동합니다...</p>
            </div>
          )}

          {data?.status === 'failed' && (
            <div className="mt-6 bg-red-950 text-red-200 p-4 rounded-lg">
              <p>이미지 분석에 실패했습니다.</p>
              {data.message && <p className="mt-2">{data.message}</p>}
            </div>
          )}

          {data?.status === 'no_data' && (
            <div className="mt-6 bg-gray-800 text-gray-300 p-4 rounded-lg">
              <p>분석 결과를 찾을 수 없습니다.</p>
            </div>
          )}

          {data?.status === 'success' && data.sarifData && (
            <div className="mt-6 bg-white rounded-xl shadow-md p-6 text-black">
              <Viewer logs={[data.sarifData]} />
            </div>
          )}

          {data?.status === 'success' && !data.sarifData && (
            <div className="mt-6 bg-green-900 text-green-200 p-4 rounded-lg">
              <p>🎉 이미지 분석이 완료되었으며, 보안 이슈가 발견되지 않았습니다!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}