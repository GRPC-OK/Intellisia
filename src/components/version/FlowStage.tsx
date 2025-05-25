// components/version/FlowStage.tsx
import React from 'react';
import clsx from 'clsx';

export type FlowStatusType =
  | 'none'
  | 'pending'
  | 'success'
  | 'fail'
  | 'approved'
  | 'rejected';

export interface FlowStageProps {
  label: string;
  status?: FlowStatusType;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const statusColors: Record<FlowStatusType, string> = {
  none: 'border-gray-600 text-gray-600',
  pending: 'border-gray-400 text-white',
  success: 'border-green-500 text-green-400',
  fail: 'border-red-500 text-red-400',
  approved: 'border-green-500 text-green-400',
  rejected: 'border-red-500 text-red-400',
};

const FlowStage: React.FC<FlowStageProps> = ({
  label,
  status = 'none',
  disabled = false,
  onClick,
  className,
  style,
  children,
}) => {
  const renderStatusText = (s: FlowStatusType): string => {
    switch (s) {
      case 'fail':
        return 'Failure';
      case 'success':
        return 'Success';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending';
      default:
        return '';
    }
  };

  return (
    <div
      className={clsx(
        'rounded-full border-2 flex flex-col justify-center items-center gap-1 text-sm font-semibold transition-all duration-200',
        statusColors[status],
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
      onClick={disabled ? undefined : onClick}
      style={{
        width: '180px',
        height: '180px',
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        ...style,
      }}
    >
      <div className="text-base font-bold leading-none whitespace-nowrap">
        {renderStatusText(status)}
      </div>
      <div className="text-sm text-center text-gray-300 leading-snug whitespace-nowrap">
        {label}
      </div>
      {children}
    </div>
  );
};

export default FlowStage;
