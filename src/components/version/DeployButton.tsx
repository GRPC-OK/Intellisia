// src/components/version/DeployButton.tsx
'use client';

import React, { useState } from 'react';

interface DeployButtonProps {
  versionId: number;
  approveStatus: string;
  deployStatus: string;
  onDeployComplete?: () => void;
}

const DeployButton: React.FC<DeployButtonProps> = ({
  versionId,
  approveStatus,
  deployStatus,
  onDeployComplete,
}) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDeploy = approveStatus === 'approved' && deployStatus !== 'pending' && deployStatus !== 'success';

  const handleDeploy = async () => {
    if (!canDeploy || isDeploying) return;

    setIsDeploying(true);
    setError(null);

    try {
      const response = await fetch(`/api/versions/${versionId}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '배포 요청 실패');
      }

      const data = await response.json();
      console.log('배포 시작:', data);
      
      // 배포 완료 콜백 호출
      onDeployComplete?.();

    } catch (err) {
      console.error('배포 실패:', err);
      setError(err instanceof Error ? err.message : '배포 실행 중 오류가 발생했습니다');
    } finally {
      setIsDeploying(false);
    }
  };

  const getButtonText = () => {
    if (isDeploying) return '배포 중...';
    if (deployStatus === 'success') return '배포 완료';
    if (deployStatus === 'pending') return '배포 진행중';
    if (approveStatus !== 'approved') return '승인 대기';
    return '배포 실행';
  };

  const getButtonStyle = () => {
    if (deployStatus === 'success') {
      return 'bg-green-600 text-white cursor-not-allowed opacity-70';
    }
    if (deployStatus === 'pending' || isDeploying) {
      return 'bg-yellow-600 text-white cursor-not-allowed opacity-70';
    }
    if (canDeploy) {
      return 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer';
    }
    return 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-70';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleDeploy}
        disabled={!canDeploy || isDeploying}
        className={`px-6 py-3 font-semibold rounded-lg transition-colors duration-200 shadow-lg ${getButtonStyle()}`}
      >
        {getButtonText()}
      </button>
      
      {error && (
        <div className="text-red-400 text-sm text-center max-w-xs">
          {error}
        </div>
      )}
      
      {deployStatus === 'fail' && (
        <div className="text-red-400 text-sm text-center">
          배포 실패 - 관리자에게 문의하세요
        </div>
      )}
    </div>
  );
};

export default DeployButton;