import VersionCard from './VersionCard';
import type { VersionSummary } from '@/types/project';

interface VersionListProps {
  versions: (VersionSummary & { onClick?: () => void })[];
  onVersionClick?: (version: VersionSummary) => void;
}

export default function VersionList({
  versions,
  onVersionClick,
}: VersionListProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {versions.map((version) => (
        <VersionCard
          key={version.name}
          name={version.name}
          description={version.description}
          isCurrent={version.isCurrent}
          onClick={() => onVersionClick?.(version)}
        />
      ))}
    </div>
  );
}
