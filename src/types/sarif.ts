export interface SarifCodeIssue {
  ruleId: string;
  message: string;
  severity: string | null;
  filePath: string;
  line: number;
  column: number;
  cwe: string | null;
  cve: string | null;
}

// 단일 result 구조 (severity, cwe, cve 없음)
export interface SarifRawResult {
  ruleId: string;
  message?: {
    text?: string;
  };
  locations?: Array<{
    physicalLocation?: {
      artifactLocation?: {
        uri?: string;
      };
      region?: {
        startLine?: number;
        startColumn?: number;
      };
    };
  }>;
}

// SARIF 원본 구조 정의 (필요한 필드만)
export interface RawSarif {
  version: string;
  runs: Array<{
    results: SarifRawResult[];
    tool?: {
      driver?: {
        rules?: Array<{
          id: string;
          defaultConfiguration?: {
            level?: string;
          };
          properties?: {
            tags?: string[];
          };
        }>;
      };
    };
  }>;
}
