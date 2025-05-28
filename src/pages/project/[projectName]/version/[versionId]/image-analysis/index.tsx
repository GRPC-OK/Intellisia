// src/pages/project/[projectName]/version/[versionId]/image-analysis/index.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import VersionHeader from '@/components/version/VersionHeader';

interface VulnerabilityData {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  package?: string;
  location?: string;
}

interface ImageAnalysisData {
  version: {
    id: number;
    name: string;
    project: {
      name: string;
      owner: {
        name: string;
      };
    };
  };
  status: string;
  hasAnalysisResult: boolean;
  vulnerabilities: VulnerabilityData[];
  summary?: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
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
        const res = await fetch(`/api/versions/${versionId}/image-analysis`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const analysisData = await res.json();
        setData(analysisData);
      } catch (err) {
        console.error('Failed to fetch image analysis data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [router.isReady, versionId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-500 bg-red-500';
      case 'High': return 'text-orange-500 bg-orange-500';
      case 'Medium': return 'text-yellow-500 bg-yellow-500';
      case 'Low': return 'text-blue-500 bg-blue-500';
      default: return 'text-gray-500 bg-gray-500';
    }
  };

  const getSeverityBorderColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'border-red-500';
      case 'High': return 'border-orange-500';
      case 'Medium': return 'border-yellow-500';
      case 'Low': return 'border-blue-500';
      default: return 'border-gray-500';
    }
  };

  const handleNext = () => {
    if (typeof projectName === 'string' && typeof versionId === 'string') {
      router.push(`/project/${projectName}/version/${versionId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-white text-lg">Loading image analysis results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-red-400 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-white text-lg">No data available</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Image Static Analysis Results</title>
      </Head>

      <div className="min-h-screen bg-[#0d1117] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <VersionHeader />

          <div className="mt-8">
            <h1 className="text-3xl font-bold mb-2">Image Static Analysis Results</h1>
            
            {data.status !== 'success' ? (
              <div className="bg-[#161b22] border border-red-500 rounded-lg p-6 mt-6">
                <p className="text-red-400 text-lg font-semibold">
                  Image analysis has not completed successfully.
                </p>
                <p className="text-gray-400 mt-2">
                  Status: {data.status}
                </p>
              </div>
            ) : !data.hasAnalysisResult ? (
              <div className="bg-[#161b22] border border-gray-600 rounded-lg p-6 mt-6">
                <p className="text-gray-400">
                  No analysis results available yet.
                </p>
              </div>
            ) : (
              <>
                {data.summary && data.summary.total > 0 ? (
                  <p className="text-gray-400 mb-8">
                    We found {data.summary.total} vulnerabilities in your container image. 
                    We recommend you review and address them as appropriate.
                  </p>
                ) : (
                  <p className="text-green-400 mb-8">
                    🎉 No vulnerabilities found in your container image!
                  </p>
                )}

                {data.summary && data.summary.total > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Vulnerability Summary</h2>
                    <div className="flex gap-4">
                      {data.summary.critical > 0 && (
                        <div className={`flex flex-col items-center p-4 rounded-lg border ${getSeverityBorderColor('Critical')} bg-[#161b22]`}>
                          <span className="text-2xl font-bold text-red-500">{data.summary.critical}</span>
                          <span className="text-sm text-gray-400">Critical</span>
                        </div>
                      )}
                      {data.summary.high > 0 && (
                        <div className={`flex flex-col items-center p-4 rounded-lg border ${getSeverityBorderColor('High')} bg-[#161b22]`}>
                          <span className="text-2xl font-bold text-orange-500">{data.summary.high}</span>
                          <span className="text-sm text-gray-400">High</span>
                        </div>
                      )}
                      {data.summary.medium > 0 && (
                        <div className={`flex flex-col items-center p-4 rounded-lg border ${getSeverityBorderColor('Medium')} bg-[#161b22]`}>
                          <span className="text-2xl font-bold text-yellow-500">{data.summary.medium}</span>
                          <span className="text-sm text-gray-400">Medium</span>
                        </div>
                      )}
                      {data.summary.low > 0 && (
                        <div className={`flex flex-col items-center p-4 rounded-lg border ${getSeverityBorderColor('Low')} bg-[#161b22]`}>
                          <span className="text-2xl font-bold text-blue-500">{data.summary.low}</span>
                          <span className="text-sm text-gray-400">Low</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {data.vulnerabilities.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Vulnerability Details</h2>
                    <div className="space-y-4">
                      {data.vulnerabilities.map((vuln, index) => (
                        <div
                          key={index}
                          className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-[#58a6ff] transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <span className="text-2xl">🛡️</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getSeverityColor(vuln.severity).split(' ')[1]}`}>
                                  {vuln.severity}
                                </span>
                                <span className="text-[#58a6ff] font-semibold">
                                  {vuln.id}
                                </span>
                              </div>
                              
                              <h3 className="text-lg font-semibold text-white mb-2">
                                {vuln.title}
                              </h3>
                              
                              <div className="text-sm text-gray-400 mb-2">
                                {vuln.package && (
                                  <div className="mb-1">
                                    <strong>Package:</strong> {vuln.package}
                                  </div>
                                )}
                                {vuln.location && (
                                  <div className="mb-1">
                                    <strong>Location:</strong> {vuln.location}
                                  </div>
                                )}
                              </div>
                              
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {vuln.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end mt-8">
              <button
                onClick={handleNext}
                className="bg-[#238636] hover:bg-[#2ea043] text-white font-medium px-6 py-2 rounded-md transition-colors"
              >
                Continue to Flow
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}