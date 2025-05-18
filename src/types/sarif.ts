// 모든 SARIF 도구가 공유하는 최소 구조
export type RawSarif = {
  runs?: Array<{
    results?: Array<{
      ruleId?: string;
      level?: string;
      message?: { text?: string };
      locations?: Array<{
        physicalLocation?: {
          artifactLocation?: { uri?: string };
          region?: { startLine?: number; startColumn?: number };
        };
      }>;
      // Trivy
      vulnerabilityId?: string;
      pkgName?: string;
      installedVersion?: string;
      fixedVersion?: string;
    }>;
  }>;
};

// Semgrep
export interface SarifCodeIssue {
  ruleId: string;
  message: string;
  severity: string | null;
  filePath: string;
  line: number;
  column: number;
}
