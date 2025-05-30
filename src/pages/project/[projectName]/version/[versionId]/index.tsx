// 2. src/pages/project/[projectName]/version/[versionId]/index.tsx

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import ApprovalModal from '@/components/version/ApprovalModal';
import VersionHeader from '@/components/version/VersionHeader';
import PipelineCard from '@/components/version/PipelineCard';
import type { PipelineStatus } from '@/components/version/PipelineCard';
import { VersionFlowStatus } from '@/types/version-flow';

// 단계별 설정
const stageConfig = {
  buildStatus: {
    title: 'Image Build',
    baseDescription: '도커 이미지를 빌드하고 레지스트리에 업로드합니다',
    route: null, // 클릭 불가
    icon: '🏗️'
  },
  codeStatus: {
    title: 'Code Analysis',
    baseDescription: 'Semgrep을 사용하여 코드 정적 분석을 수행합니다',
    route: 'code-analysis',
    icon: '🔍'
  },
  imageStatus: {
    title: 'Image Analysis',
    baseDescription: 'Trivy를 사용하여 이미지 보안 스캔을 수행합니다',
    route: 'image-analysis',
    icon: '🛡️'
  },
  approveStatus: {
    title: 'Approval',
    baseDescription: '검토 후 배포 승인을 진행합니다',
    route: null, // 모달로 처리
    icon: '✅'
  },
  deployStatus: {
    title: 'Deploy',
    baseDescription: 'ArgoCD를 통해 쿠버네티스에 배포합니다',
    route: 'deployment-executed',
    icon: '🚀'
  }
};

// 상태별 설명 생성
const getStageDescription = (key: keyof typeof stageConfig, status: string, data?: VersionFlowStatus) => {
  const base = stageConfig[key].baseDescription;
  
  switch (status) {
    case 'success':
      if (key === 'codeStatus') return `${base} - 분석이 완료되었습니다`;
      if (key === 'buildStatus') return `${base} - 이미지가 성공적으로 빌드되었습니다`;
      if (key === 'imageStatus') return `${base} - 보안 스캔이 완료되었습니다`;
      if (key === 'deployStatus') return `${base} - 배포가 완료되었습니다`;
      return `${base} - 성공적으로 완료되었습니다`;
    
    case 'pending':
      if (key === 'codeStatus') return `${base} - Semgrep 분석 실행 중...`;
      if (key === 'buildStatus') return `${base} - 도커 이미지 빌드 중...`;
      if (key === 'imageStatus') return `${base} - Trivy 보안 스캔 실행 중...`;
      if (key === 'approveStatus') return `${base} - 개발팀의 검토를 기다리고 있습니다`;
      if (key === 'deployStatus') return `${base} - ArgoCD에서 배포 중...`;
      return `${base} - 처리 중입니다...`;
    
    case 'fail':
      if (key === 'codeStatus') return `${base} - 코드 분석에서 오류가 발생했습니다`;
      if (key === 'buildStatus') return `${base} - 이미지 빌드에 실패했습니다`;
      if (key === 'imageStatus') return `${base} - 보안 스캔에서 문제가 발견되었습니다`;
      if (key === 'deployStatus') return `${base} - 배포 중 오류가 발생했습니다`;
      return `${base} - 처리 중 오류가 발생했습니다`;
    
    case 'approved':
      return `${base} - 승인이 완료되었습니다`;
    
    case 'rejected':
      return `${base} - 승인이 거부되었습니다`;
    
    default:
      return base;
  }
};

// 예상 시간 계산
const getEstimatedTime = (key: keyof typeof stageConfig) => {
  const times = {
    buildStatus: '4-6분',
    codeStatus: '2-3분',
    imageStatus: '3-5분',
    approveStatus: '검토 대기',
    deployStatus: '1-2분'
  };
  return times[key];
};

export default function VersionFlowPage() {
  const router = useRouter();
  const { versionId, projectName } = router.query;

  const [data, setData] = useState<VersionFlowStatus | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/versions/${versionId}/flow-status`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json: VersionFlowStatus = await res.json();
      setData(json);

      if (json.flowStatus === 'success' && pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [versionId]);

  useEffect(() => {
    if (!router.isReady || typeof versionId !== 'string') return;

    fetchStatus();
    pollingRef.current = setInterval(fetchStatus, 10000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [router.isReady, versionId, fetchStatus]);

  const handleCardClick = (key: keyof typeof stageConfig, status: string) => {
    if (typeof projectName !== 'string' || typeof versionId !== 'string') return;
    
    // Approval은 모달로 처리
    if (key === 'approveStatus' && status === 'pending') {
      setShowModal(true);
      return;
    }

    // 클릭 가능한 상태와 라우트가 있는 경우만 이동
    const route = stageConfig[key].route;
    if (route && (status === 'success' || status === 'fail')) {
      router.push(`/project/${projectName}/version/${versionId}/${route}`);
    }
  };

  const handleApproval = async (approved: boolean) => {
    if (typeof versionId !== 'string') return;

    try {
      const res = await fetch(`/api/versions/${versionId}/approval-decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      setShowModal(false);
      await fetchStatus(); // 상태 새로고침
    } catch (err) {
      console.error('Failed to approve:', err);
      setError(err instanceof Error ? err.message : 'Approval failed');
    }
  };

  // 전체 진행률 계산
  const calculateOverallProgress = (data: VersionFlowStatus) => {
    const stages = ['buildStatus', 'codeStatus', 'imageStatus', 'approveStatus', 'deployStatus'] as const;
    const completed = stages.filter(stage => {
      const status = data[stage];
      return status === 'success' || status === 'approved';
    }).length;
    return Math.round((completed / stages.length) * 100);
  };

  if (!router.isReady || loading || !data) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-white text-lg flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span>{loading ? 'Loading...' : 'No data available'}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">오류가 발생했습니다</div>
          <div className="text-gray-400">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress(data);

  return (
    <div className="min-h-screen bg-[#0d1117] px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl w-full">
        <VersionHeader />

        {/* 전체 진행률 */}
        <div className="mt-8 mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold">배포 파이프라인</h2>
            <span className="text-lg text-gray-300">{overallProgress}% 완료</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {data.flowStatus === 'pending' ? '파이프라인이 진행 중입니다...' : 
             data.flowStatus === 'success' ? '모든 단계가 성공적으로 완료되었습니다!' :
             data.flowStatus === 'fail' ? '파이프라인 실행 중 오류가 발생했습니다.' :
             '파이프라인 실행을 시작합니다.'}
          </p>
        </div>

        {/* 파이프라인 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(Object.keys(stageConfig) as Array<keyof typeof stageConfig>).map((key) => {
            const rawStatus = data[key];
            // ApproveStatus 타입을 PipelineStatus로 변환
            const status: PipelineStatus = key === 'approveStatus' 
              ? (rawStatus === 'approved' ? 'approved' : rawStatus === 'rejected' ? 'rejected' : rawStatus as PipelineStatus)
              : rawStatus as PipelineStatus;
            
            const config = stageConfig[key];
            const isClickable = config.route && (status === 'success' || status === 'fail') ||
                               (key === 'approveStatus' && status === 'pending');

            return (
              <PipelineCard
                key={key}
                title={config.title}
                description={getStageDescription(key, status, data)}
                status={status}
                estimatedTime={status === 'pending' ? getEstimatedTime(key) : undefined}
                completedTime={status === 'success' || status === 'approved' ? '방금 전' : undefined}
                onClick={isClickable ? () => handleCardClick(key, status) : undefined}
                disabled={!isClickable}
                icon={config.icon}
              />
            );
          })}
        </div>

        {/* Review 버튼 (승인 대기 시에만 표시) */}
        {data.approveStatus === 'pending' && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🔍 배포 승인 검토
            </button>
          </div>
        )}

        {/* 추가 정보 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">📊 파이프라인 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">버전:</span>
                <span>{data.versionName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">전체 상태:</span>
                <span className={
                  data.flowStatus === 'success' ? 'text-green-400' :
                  data.flowStatus === 'pending' ? 'text-orange-400' :
                  data.flowStatus === 'fail' ? 'text-red-400' : 'text-gray-400'
                }>
                  {data.flowStatus === 'success' ? '완료' :
                   data.flowStatus === 'pending' ? '진행 중' :
                   data.flowStatus === 'fail' ? '실패' : '대기'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">진행률:</span>
                <span>{overallProgress}%</span>
              </div>
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-400">💡 다음 단계</h3>
            <div className="text-sm text-gray-300">
              {data.approveStatus === 'pending' ? 
                '승인 검토가 필요합니다. 위의 "배포 승인 검토" 버튼을 클릭하세요.' :
               data.deployStatus === 'pending' ?
                '배포가 진행 중입니다. 완료까지 1-2분 정도 소요됩니다.' :
               data.flowStatus === 'success' ?
                '모든 단계가 완료되었습니다! 배포된 애플리케이션을 확인하세요.' :
               data.flowStatus === 'fail' ?
                '실패한 단계를 클릭하여 상세 정보를 확인하세요.' :
                '파이프라인이 자동으로 진행됩니다.'}
            </div>
          </div>
        </div>
      </div>

      <ApprovalModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onApprove={() => handleApproval(true)}
        onReject={() => handleApproval(false)}
        data={data}
      />
    </div>
  );
}
