'use client';

import React from 'react';
import { VersionFlowStatus } from '@/types/version-flow';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  data: VersionFlowStatus;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  data,
}) => {
  if (!isOpen) return null;

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      none: { text: 'Not Started', color: 'text-gray-400' },
      pending: { text: 'Pending', color: 'text-white' },
      success: { text: 'Success', color: 'text-green-400' },
      fail: { text: 'Failure', color: 'text-red-400' },
    };
    return statusMap[status] || { text: status, color: 'text-white' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-[#1c1f26] p-6 rounded-lg w-full max-w-md">
        {/* ✅ X 버튼을 모달 내부 오른쪽 상단에 위치시킴 */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>

        <h2 className="text-lg font-semibold text-white mb-4 text-center">
          배포 승인
        </h2>

        <div className="bg-[#0d1117] p-4 rounded-md mb-6">
          <div className="text-sm text-gray-300 mb-2">현재 상태</div>
          {(['buildStatus', 'imageStatus', 'codeStatus'] as const).map(
            (key) => (
              <div
                key={key}
                className="flex justify-between text-sm text-white py-1"
              >
                <span>
                  {key === 'buildStatus'
                    ? 'Image Build'
                    : key === 'imageStatus'
                      ? 'Image Static Analysis'
                      : 'Code Static Analysis'}
                </span>
                <span
                  className={`${getStatusDisplay(data[key]).color} font-semibold`}
                >
                  {getStatusDisplay(data[key]).text}
                </span>
              </div>
            )
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onReject}
            className="min-w-[80px] bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
          >
            Reject
          </button>
          <button
            onClick={onApprove}
            className="min-w-[80px] bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;
