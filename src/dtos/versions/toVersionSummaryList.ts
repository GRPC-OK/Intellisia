import { VersionSummary } from '@/types/project';

export function toVersionSummaryList(
  versions: {
    id: number;
    name: string;
    description: string;
    isCurrent: boolean;
  }[]
): VersionSummary[] {
  return versions.map((v) => ({
    id: v.id,
    name: v.name,
    description: v.description,
    isCurrent: v.isCurrent,
  }));
}
