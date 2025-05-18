import { RawSarif, SarifCodeIssue } from '@/types/sarif';

// Semgrep SARIF에서 필요한 이슈만 추출
export function extractSemgrepIssues(sarif: RawSarif): SarifCodeIssue[] {
  const results = sarif?.runs?.[0]?.results ?? [];

  return results.map((result): SarifCodeIssue => {
    const loc = result?.locations?.[0]?.physicalLocation;

    return {
      ruleId: result.ruleId || '',
      message: result.message?.text || '',
      severity: result.level ?? null,
      filePath: loc?.artifactLocation?.uri || '',
      line: loc?.region?.startLine || 0,
      column: loc?.region?.startColumn || 0,
    };
  });
}
