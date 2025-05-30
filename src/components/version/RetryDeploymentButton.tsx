'use client';

import React from 'react';

interface RetryDeploymentButtonProps {
  onClick: () => void;
}

const RetryDeploymentButton: React.FC<RetryDeploymentButtonProps> = ({
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="mt-8 px-8 py-3 font-semibold rounded-lg transition-colors duration-200 shadow-lg bg-red-600 hover:bg-red-700 text-white"
    >
      Retry Deployment
    </button>
  );
};

export default RetryDeploymentButton;
