// 1. src/components/version/PipelineCard.tsx

import React from 'react';
import clsx from 'clsx';

export type PipelineStatus = 'none' | 'pending' | 'success' | 'fail' | 'approved' | 'rejected';

export interface PipelineCardProps {
  title: string;
  description: string;
  status: PipelineStatus;
  estimatedTime?: string;
  completedTime?: string;
  progress?: number;
  onClick?: () => void;
  disabled?: boolean;
  icon?: string;
}

const statusConfig = {
  none: {
    bgGradient: 'from-gray-800 to-gray-900',
    borderColor: 'border-gray-600',
    iconBg: 'bg-gray-600',
    icon: '⏸',
    progressBg: 'bg-gray-600',
    statusText: '대기 중',
    statusColor: 'text-gray-400',
    animate: false
  },
  pending: {
    bgGradient: 'from-orange-900/30 to-red-900/20',
    borderColor: 'border-orange-500',
    iconBg: 'bg-orange-500',
    icon: '⟳',
    progressBg: 'bg-orange-500',
    statusText: '진행 중',
    statusColor: 'text-orange-400',
    animate: true
  },
  success: {
    bgGradient: 'from-green-900/30 to-green-800/20',
    borderColor: 'border-green-500',
    iconBg: 'bg-green-500',
    icon: '✓',
    progressBg: 'bg-green-500',
    statusText: '완료',
    statusColor: 'text-green-400',
    animate: false
  },
  fail: {
    bgGradient: 'from-red-900/30 to-red-800/20',
    borderColor: 'border-red-500',
    iconBg: 'bg-red-500',
    icon: '✗',
    progressBg: 'bg-red-500',
    statusText: '실패',
    statusColor: 'text-red-400',
    animate: false
  },
  approved: {
    bgGradient: 'from-blue-900/30 to-blue-800/20',
    borderColor: 'border-blue-500',
    iconBg: 'bg-blue-500',
    icon: '✓',
    progressBg: 'bg-blue-500',
    statusText: '승인됨',
    statusColor: 'text-blue-400',
    animate: false
  },
  rejected: {
    bgGradient: 'from-red-900/30 to-red-800/20',
    borderColor: 'border-red-500',
    iconBg: 'bg-red-500',
    icon: '✗',
    progressBg: 'bg-red-500',
    statusText: '거부됨',
    statusColor: 'text-red-400',
    animate: false
  }
};

const PipelineCard: React.FC<PipelineCardProps> = ({
  title,
  description,
  status,
  estimatedTime,
  completedTime,
  progress = 0,
  onClick,
  disabled = false,
  icon
}) => {
  const config = statusConfig[status];
  const displayIcon = icon || config.icon;
  
  // progress 계산
  const progressPercentage = status === 'success' || status === 'approved' 
    ? 100 
    : status === 'pending' 
      ? progress || 60 
      : status === 'fail' || status === 'rejected'
        ? 30
        : 0;

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300',
        'bg-gradient-to-br', config.bgGradient,
        config.borderColor,
        !disabled && onClick && 'cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-black/20',
        disabled && 'opacity-60 cursor-not-allowed',
        config.animate && 'animate-pulse'
      )}
      onClick={!disabled ? onClick : undefined}
    >
      {/* 배경 효과 */}
      {(status === 'success' || status === 'pending') && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={clsx(
            'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg',
            config.iconBg,
            config.animate && 'animate-spin'
          )}>
            {displayIcon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <span className={clsx('text-sm font-medium', config.statusColor)}>
              {config.statusText}
            </span>
          </div>
        </div>
        
        {/* 시간 정보 */}
        <div className="text-right">
          {completedTime && (
            <div className="text-xs text-gray-400">
              완료: {completedTime}
            </div>
          )}
          {estimatedTime && status === 'pending' && (
            <div className="text-xs text-orange-300">
              예상: {estimatedTime}
            </div>
          )}
        </div>
      </div>

      {/* 설명 */}
      <p className="text-gray-300 text-sm mb-4 leading-relaxed">
        {description}
      </p>

      {/* 진행률 바 */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">진행률</span>
          <span className="text-xs text-gray-400">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={clsx(
              'h-full transition-all duration-500 rounded-full',
              config.progressBg,
              status === 'pending' && 'animate-pulse'
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 추가 정보 또는 액션 */}
      {status === 'success' && onClick && (
        <div className="text-xs text-green-300 hover:text-green-200 transition-colors">
          📋 상세보기 →
        </div>
      )}
      {status === 'fail' && onClick && (
        <div className="text-xs text-red-300 hover:text-red-200 transition-colors">
          🔍 오류 확인 →
        </div>
      )}
      {status === 'pending' && (
        <div className="text-xs text-orange-300">
          ⏳ 처리 중...
        </div>
      )}
    </div>
  );
};

export default PipelineCard;