import { VersionSummary } from '@/types/project';

export function toVersionSummaryList(
  versions: {
    name: string;
    description: string;
    isCurrent: boolean;
  }[]
): VersionSummary[] {
  return versions.map((v) => ({
    name: v.name,
    description: v.description,
    isCurrent: v.isCurrent,
  }));
}
