import React from 'react';

export interface LineCoord {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  arrow?: boolean;
}

interface FlowConnectorProps {
  lines: LineCoord[];
}

const FlowConnector: React.FC<FlowConnectorProps> = ({ lines }) => {
  return (
    <svg className="absolute top-0 left-0 w-full h-full z-0">
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" />
        </marker>
      </defs>

      {lines.map((line, idx) => (
        <line
          key={idx}
          x1={`${line.x1}%`}
          y1={`${line.y1}%`}
          x2={`${line.x2}%`}
          y2={`${line.y2}%`}
          stroke={line.color ?? '#ffffff'}
          strokeWidth="2"
          strokeLinecap="round"
          markerEnd={line.arrow ? 'url(#arrow)' : undefined}
        />
      ))}
    </svg>
  );
};

export default FlowConnector;
