'use client';

import React from 'react';

interface ReviewDeployButtonProps {
  enabled: boolean;
  onClick: () => void;
}

const ReviewDeployButton: React.FC<ReviewDeployButtonProps> = ({
  enabled,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`mt-8 px-8 py-3 font-semibold rounded-lg transition-colors duration-200 shadow-lg ${
        enabled
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-gray-700 text-gray-300 cursor-not-allowed'
      }`}
    >
      Review Deployment
    </button>
  );
};

export default ReviewDeployButton;
