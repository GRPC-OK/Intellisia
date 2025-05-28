'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import FlowStage, { FlowStatusType } from '@/components/version/FlowStage';
import FlowConnector from '@/components/version/FlowConnector';
import ApprovalModal from '@/components/version/ApprovalModal';
import VersionHeader from '@/components/version/VersionHeader';
import { VersionFlowStatus } from '@/types/version-flow';
import {
  STAGE_CENTER,
  StageKey,
  isStageClickable,
  getStageRoute,
  canShowReviewButton,
  generateFlowConnections,
} from '@/lib/version-flow-utils';

export default function VersionFlowPage() {
  const router = useRouter();
  const { versionId, projectName } = router.query;
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleStageClick = (key: StageKey) => {
    if (
      !data ||
      typeof projectName !== 'string' ||
      typeof versionId !== 'string'
    )
      return;
    if (!isStageClickable(key, data)) return;
    const route = getStageRoute(key, projectName, versionId);
    if (route) router.push(route);
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

<<<<<<< HEAD
      // 승인 후 즉시 상태 업데이트 (배포 시작됨)
      await fetchStatus();
      
=======
      const statusRes = await fetch(`/api/versions/${versionId}/flow-status`);
      if (statusRes.ok) {
        const json = await statusRes.json();
        setData(json);
      }
>>>>>>> e383dde (feat: 배포 승인 시 approval API 호출 및 flow 상태 갱신 로직 추가)
    } catch (err) {
      console.error('Failed to approve:', err);
      setError(err instanceof Error ? err.message : 'Approval failed');
    }
  };

  if (
    !router.isReady ||
    loading ||
    !data ||
    typeof projectName !== 'string' ||
    typeof versionId !== 'string'
  ) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-white text-lg">
          {loading ? 'Loading...' : 'No data available'}
        </div>
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

  const connections = generateFlowConnections();
  const reviewButtonEnabled = canShowReviewButton(data);

  return (
    <div className="min-h-screen bg-[#0d1117] px-4 py-10 text-white">
      <div className="mx-auto max-w-[1600px] w-full">
        <VersionHeader />

        <div className="flex flex-col items-center mt-10">
          <div className="w-full flex justify-center">
            <div
              ref={containerRef}
              className="relative w-full max-w-[1800px] aspect-[2.3] mx-auto overflow-visible bg-[#161b22] border border-gray-700 rounded-lg"
            >
              <FlowConnector lines={connections} />

              {(
                Object.entries(STAGE_CENTER) as [
                  StageKey,
                  (typeof STAGE_CENTER)[StageKey],
                ][]
              ).map(([key, coord]) => {
                const rawStatus = (data?.[key as keyof VersionFlowStatus] ??
                  'none') as FlowStatusType;
                const isApproval = key === 'approveStatus';

                return (
                  <div
                    key={key}
                    className="absolute"
                    style={{
                      left: `${coord.x}%`,
                      top: `${coord.y}%`,
                      transform: `translate(-50%, -50%)`,
                    }}
                  >
                    <div className="relative flex flex-col items-center gap-y-1 leading-tight">
                      <FlowStage
                        label={key}
                        status={rawStatus}
                        disabled={!isStageClickable(key, data)}
                        onClick={() => handleStageClick(key)}
                      />
                      {isApproval && (
                        <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2">
                          <button
                            onClick={() => setShowModal(true)}
                            disabled={!reviewButtonEnabled}
                            className={`text-sm px-4 py-2 font-semibold rounded-md z-20 transition-all duration-200 ${
                              reviewButtonEnabled
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Review Deployment
                          </button>
                        </div>
                      )}
<<<<<<< HEAD

                      {/* 배포 상태 표시만 (버튼 제거) */}
                      {isDeploy && data.approveStatus === 'approved' && (
                        <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2">
                          <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                            data.deployStatus === 'success' 
                              ? 'bg-green-600 text-white' 
                              : data.deployStatus === 'pending'
                              ? 'bg-yellow-600 text-white'
                              : data.deployStatus === 'fail'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-600 text-gray-300'
                          }`}>
                            {data.deployStatus === 'success' && '✅ 배포 완료'}
                            {data.deployStatus === 'pending' && '⏳ 배포 진행 중'}
                            {data.deployStatus === 'fail' && '❌ 배포 실패'}
                            {data.deployStatus === 'none' && '⏸️ 배포 대기'}
                          </div>
                        </div>
                      )}
=======
>>>>>>> e383dde (feat: 배포 승인 시 approval API 호출 및 flow 상태 갱신 로직 추가)
                    </div>
                  </div>
                );
              })}
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
