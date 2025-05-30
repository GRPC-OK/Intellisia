'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import FlowStage, { FlowStatusType } from '@/components/version/FlowStage';
import FlowConnector from '@/components/version/FlowConnector';
import ApprovalModal from '@/components/version/ApprovalModal';
import ReviewDeployButton from '@/components/version/ReviewDeployButton';
import RetryDeploymentButton from '@/components/version/RetryDeploymentButton';
import RetryDeploymentModal from '@/components/version/RetryDeploymentModal';
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
  const [retryModal, setRetryModal] = useState(false);
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
      fetchStatus();
    } catch (err) {
      console.error('Failed to approve:', err);
      setError(err instanceof Error ? err.message : 'Approval failed');
    }
  };

  const handleRetryDeployment = async () => {
    if (typeof versionId !== 'string') return;

    try {
      const res = await fetch(`/api/versions/${versionId}/retry-deployment`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      setRetryModal(false);
      fetchStatus();
    } catch (err) {
      console.error('Failed to retry deployment:', err);
      setError(err instanceof Error ? err.message : 'Retry failed');
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
  const canRetry =
    data.approveStatus === 'approved' && data.deployStatus === 'fail';

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
                    <div className="relative flex flex-col items-center gap-y-2 leading-tight">
                      <FlowStage
                        label={key}
                        status={rawStatus}
                        disabled={!isStageClickable(key, data)}
                        onClick={() => handleStageClick(key)}
                      />
                      {isApproval && (
                        <>
                          <ReviewDeployButton
                            enabled={reviewButtonEnabled}
                            onClick={() => setShowModal(true)}
                          />
                          {canRetry && (
                            <RetryDeploymentButton
                              onClick={() => setRetryModal(true)}
                            />
                          )}
                        </>
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

      <RetryDeploymentModal
        isOpen={retryModal}
        onClose={() => setRetryModal(false)}
        onConfirm={handleRetryDeployment}
      />
    </div>
  );
}
