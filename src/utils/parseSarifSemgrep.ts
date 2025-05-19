import type { SarifCodeIssue, RawSarif } from '@/types/sarif';

export function extractSemgrepIssuesWithRule(
  sarif: RawSarif
): SarifCodeIssue[] {
  const results = sarif?.runs?.[0]?.results ?? [];
  const rules = sarif?.runs?.[0]?.tool?.driver?.rules ?? [];

  const ruleMap = new Map(rules.map((rule) => [rule.id, rule]));

  return results.map((result): SarifCodeIssue => {
    const loc = result?.locations?.[0]?.physicalLocation;
    const rule = ruleMap.get(result.ruleId);
    const tags = rule?.properties?.tags ?? [];

    const cwe = tags.find((tag) => tag.startsWith('CWE-')) ?? null;
    const cve = tags.find((tag) => tag.startsWith('CVE-')) ?? null;

    return {
      ruleId: result.ruleId || '',
      message: result.message?.text || '',
      severity: rule?.defaultConfiguration?.level ?? null,
      filePath: loc?.artifactLocation?.uri || '',
      line: loc?.region?.startLine || 0,
      column: loc?.region?.startColumn || 0,
      cwe,
      cve,
    };
  });
}
