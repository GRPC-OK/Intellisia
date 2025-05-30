import { useRouter } from 'next/router';
import Head from 'next/head';
import VersionHeader from '@/components/version/VersionHeader';
import { useEffect, useState } from 'react';

interface ProjectData {
  project: {
    name: string;
    domain: string;
  };
  version: {
    name: string;
    imageTag: string;
    createdAt: string;
  };
}

export default function DeploymentExecutedPage() {
  const router = useRouter();
  const { projectName, versionId } = router.query;
  const [isReady, setIsReady] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      setIsReady(true);
      // 실제 프로젝트 데이터를 가져오는 API 호출
      // 현재는 URL 파라미터를 기반으로 임시 데이터 생성
      if (projectName && versionId) {
        setProjectData({
          project: {
            name: projectName as string,
            domain: `${projectName}.intellisia.site`,
          },
          version: {
            name: 'v1.2.5', // 실제로는 API에서 가져올 데이터
            imageTag: '98b8ad5',
            createdAt: new Date().toISOString(),
          },
        });
      }
    }
  }, [router.isReady, projectName, versionId]);

  const handleCopyUrl = async () => {
    if (projectData) {
      const url = `https://${projectData.project.domain}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('클립보드 복사 실패:', err);
      }
    }
  };

  const handleVisitSite = () => {
    if (projectData) {
      window.open(`https://${projectData.project.domain}`, '_blank');
    }
  };

  const handleArgoCD = () => {
    window.open(
      'https://argocd.intellisia.site/applications?showFavorites=false&proj=&sync=&autoSync=&health=&namespace=&cluster=&labels=',
      '_blank'
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isReady || !projectData) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>배포 완료 - {projectData.project.name}</title>
      </Head>

      <div className="min-h-screen bg-[#0d1117] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <VersionHeader />

          <div className="max-w-2xl mx-auto mt-16">
            {/* Success Icon with Animation */}
            <div className="relative flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg width="48" height="48" fill="white" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                {/* Ping animation ring */}
                <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-green-500 opacity-30 animate-ping"></div>
                <div
                  className="absolute inset-0 w-24 h-24 rounded-full border-2 border-green-500 opacity-20 animate-ping"
                  style={{ animationDelay: '0.5s' }}
                ></div>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 text-white">
                🎉 배포가 완료되었습니다!
              </h1>
              <p className="text-xl text-gray-400">
                <span className="text-blue-400 font-semibold">{projectData.project.name}</span> 프로젝트가 성공적으로 배포되어 접속 가능합니다
              </p>
            </div>

            {/* Deployment Meta Information */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 mb-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center py-3 border-b border-[#21262d] last:border-b-0">
                  <span className="text-gray-400 font-medium">🌐 배포 URL</span>
                  <span className="text-blue-400 font-semibold">
                    {projectData.project.domain}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#21262d] last:border-b-0">
                  <span className="text-gray-400 font-medium">📦 버전</span>
                  <span className="text-white font-semibold">
                    {projectData.version.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#21262d] last:border-b-0">
                  <span className="text-gray-400 font-medium">🏷️ 이미지 태그</span>
                  <span className="text-white font-semibold font-mono text-sm bg-[#21262d] px-3 py-1 rounded">
                    {projectData.version.imageTag}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400 font-medium">⏱️ 배포 시간</span>
                  <span className="text-white font-semibold">
                    {formatTime(projectData.version.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Fancy URL Display */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-400 mb-3">
                🔗 프로덕션 URL
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-[#21262d] border border-[#30363d] rounded-lg p-4 group-hover:border-blue-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-mono text-lg text-blue-400 truncate">
                        https://{projectData.project.domain}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyUrl}
                      className="ml-4 flex-shrink-0 p-2 hover:bg-[#30363d] rounded-lg transition-colors group/btn"
                      title="URL 복사"
                    >
                      {copied ? (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 group-hover/btn:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Subtle animation line */}
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                </div>
              </div>
              
              {copied && (
                <div className="mt-2 text-sm text-green-400 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  URL이 클립보드에 복사되었습니다!
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleVisitSite}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/25"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                웹사이트 열기
              </button>
              
              <button
                onClick={handleArgoCD}
                className="flex items-center justify-center gap-3 bg-[#21262d] hover:bg-[#30363d] text-white font-semibold py-4 px-8 rounded-lg border border-[#30363d] hover:border-[#58a6ff] transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                ArgoCD 확인
              </button>
            </div>

            {/* Status Indicator */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">서비스가 정상적으로 실행 중입니다</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
}