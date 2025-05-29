import type { VersionFlowStatus } from '@/types/version-flow';
import type { LineCoord } from '@/components/version/FlowConnector';

export const STAGE_CENTER = {
  buildStatus: { x: 20, y: 30 },
  codeStatus: { x: 20, y: 70 },
  imageStatus: { x: 45, y: 30 },
  approveStatus: { x: 70, y: 50 },
  deployStatus: { x: 95, y: 50 },
} as const;

export const RADIUS = 6;
export type StageKey = keyof typeof STAGE_CENTER;

export const isStageClickable = (
  key: StageKey,
  data: VersionFlowStatus
): boolean => {
  if (key === 'approveStatus' || key === 'buildStatus') return false;
  const status = data[key];
  return status === 'success' || status === 'fail';
};

export const getStageRoute = (
  key: StageKey,
  projectId: string,
  versionId: string
): string => {
  const pathMap: Record<StageKey, string | undefined> = {
    buildStatus: undefined, // 클릭해도 경로 없음
    imageStatus: 'image-analysis',
    codeStatus: 'code-analysis',
    approveStatus: undefined,
    deployStatus: 'deployment-executed',
  };

  const path = pathMap[key];
  return path ? `/project/${projectId}/version/${versionId}/${path}` : '';
};

export const canShowReviewButton = (data: VersionFlowStatus): boolean => {
  return (
    data.approveStatus === 'pending' &&
    ['buildStatus', 'imageStatus', 'codeStatus'].some(
      (key) =>
        data[key as keyof VersionFlowStatus] === 'success' ||
        data[key as keyof VersionFlowStatus] === 'fail'
    )
  );
};

export const shouldPollFlowStatus = (data: VersionFlowStatus): boolean => {
  return data.flowStatus === 'pending';
};

export const generateFlowConnections = (): LineCoord[] => [
  { x1: 22, y1: 30, x2: 28, y2: 30, arrow: true }, // build → image
  { x1: 47, y1: 30, x2: 57, y2: 48, arrow: true }, // image → approve
  { x1: 23, y1: 70, x2: 40, y2: 70, arrow: false }, // code → 중간
  { x1: 40, y1: 70, x2: 57, y2: 55, arrow: true }, // 중간 → approve
  { x1: 71, y1: 50, x2: 76, y2: 50, arrow: true }, // approve → deploy
];
