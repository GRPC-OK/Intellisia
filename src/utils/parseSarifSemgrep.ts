import type { RawSarif, SarifCodeIssue } from '@/types/sarif';

export function extractSemgrepIssues(sarif: RawSarif): SarifCodeIssue[] {
  return sarif.runs.flatMap((run) =>
    run.results.map((result) => {
      const loc = result.locations?.[0]?.physicalLocation;
      const tags = result.properties?.tags ?? [];

      return {
        ruleId: result.ruleId || '',
        message: result.message?.text || '',
        severity: result.level ?? null,
        filePath: loc?.artifactLocation?.uri || '',
        line: loc?.region?.startLine || 0,
        column: loc?.region?.startColumn || 0,
        cwe: tags.find((tag) => tag.startsWith('CWE-')) ?? null,
        cve: tags.find((tag) => tag.startsWith('CVE-')) ?? null,
      };
    })
  );
}
