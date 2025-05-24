'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import FlowStage, { FlowStatusType } from '@/components/version/FlowStage';
import FlowConnector from '@/components/version/FlowConnector';
import ApprovalModal from '@/components/version/ApprovalModal';
import VersionHeader from '@/components/version/VersionHeader';
import { VersionFlowStatus } from '@/types/version-flow';
import {
  STAGE_CENTER,
  RADIUS,
  StageKey,
  isStageClickable,
  getStageRoute,
  canShowReviewButton,
  shouldPollFlowStatus,
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

  useEffect(() => {
    if (!router.isReady || typeof versionId !== 'string') return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/versions/${versionId}/flow-status`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        setData(json);

        if (!shouldPollFlowStatus(json)) {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Failed to fetch status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(fetchStatus, 10000);
    fetchStatus();

    return () => clearInterval(interval);
  }, [router.isReady, versionId]);

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
      const res = await fetch(`/api/versions/${versionId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      setShowModal(false);

      const statusRes = await fetch(`/api/versions/${versionId}/flow-status`);
      if (statusRes.ok) {
        const json = await statusRes.json();
        setData(json);
      }
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
                      transform: 'translate(-50%, -50%)',
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
