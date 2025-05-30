'use client';

import React from 'react';

interface RetryDeploymentButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const RetryDeploymentButton: React.FC<RetryDeploymentButtonProps> = ({
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`mt-8 px-8 py-3 font-semibold rounded-lg transition-colors duration-200 shadow-lg text-white
        ${disabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}
      `}
    >
      Retry Deployment
    </button>
  );
};

export default RetryDeploymentButton;
