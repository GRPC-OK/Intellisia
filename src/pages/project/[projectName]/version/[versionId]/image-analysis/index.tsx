import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Viewer = dynamic(
  () => import('@microsoft/sarif-web-component').then((mod) => mod.Viewer),
  { ssr: false }
);

export default function ImageAnalysisPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || typeof versionId !== 'string') return;

    const fetchAnalysisData = async () => {
      try {
        const res = await fetch(`/api/versions/${versionId}/image-analysis`);
        const analysisData = await res.json();
        setData(analysisData);
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [router.isReady, versionId]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <VersionHeader />
        
        <h1 className="text-3xl font-bold mb-2">Image Static Analysis Results</h1>
        
        {loading ? (
          <div>Loading analysis results...</div>
        ) : data?.sarifData ? (
          <div className="mt-6">
            <Viewer sarif={data.sarifData} />
          </div>
        ) : (
          <div>No analysis results available</div>
        )}
      </div>
    </div>
  );
}