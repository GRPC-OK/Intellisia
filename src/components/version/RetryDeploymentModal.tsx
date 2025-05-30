'use client';

import React from 'react';

interface RetryDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

const RetryDeploymentModal: React.FC<RetryDeploymentModalProps> = ({
  isOpen,
  onClose,
  onRetry,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-[#1c1f26] p-6 rounded-lg w-full max-w-md">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>

        <h2 className="text-lg font-semibold text-white mb-4 text-center">
          재배포 시도
        </h2>

        <div className="bg-[#0d1117] p-4 rounded-md mb-6">
          <p className="text-sm text-gray-300 mb-2">
            이 버전은 승인되었지만 배포에 실패했습니다.
          </p>
          <p className="text-sm text-white">재배포를 다시 시도하시겠습니까?</p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="min-w-[80px] bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm"
          >
            취소
          </button>
          <button
            onClick={onRetry}
            className="min-w-[80px] bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
          >
            재배포
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetryDeploymentModal;
