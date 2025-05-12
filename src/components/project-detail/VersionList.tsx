import React from 'react';
import { Version } from '@/types/project';
import VersionCard from './VersionCard';

interface VersionListProps {
  versions: Version[];
  onVersionClick: (version: Version) => void;
}

const VersionList: React.FC<VersionListProps> = ({
  versions,
  onVersionClick,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5em',
        width: '100%',
      }}
    >
      {versions.map((version) => (
        <VersionCard
          key={version.id}
          version={version}
          onClick={() => onVersionClick(version)}
        />
      ))}
    </div>
  );
};

export default VersionList;
