import prisma from '@/lib/prisma';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';
import type { SarifCodeIssue, RawSarif } from '@/types/sarif';
import { extractSemgrepIssuesWithRule } from '@/utils/parseSarifSemgrep';

export async function handleSemgrepResult(
  versionId: number,
  sarifRaw: unknown,
  contentType?: string
) {
  if (!contentType?.includes('application/json')) {
    await prisma.codeAnalysis.upsert({
      where: { versionId },
      update: {
        errorLog: 'Invalid content type or failed analysis',
        status: 'fail',
        hasIssue: false,
      },
      create: {
        versionId,
        errorLog: 'Invalid content type or failed analysis',
        status: 'fail',
        hasIssue: false,
      },
    });

    await updateVersionStatusSafely(versionId, {
      codeStatus: 'fail',
      flowStatus: 'fail',
    });

    return;
  }

  try {
    const sarif = sarifRaw as RawSarif;
    const issues: SarifCodeIssue[] = extractSemgrepIssuesWithRule(sarif);
    await prisma.$transaction(async (tx) => {
      const analysis = await tx.codeAnalysis.upsert({
        where: { versionId },
        update: {
          errorLog: null,
          status: 'success',
          hasIssue: issues.length > 0,
        },
        create: {
          versionId,
          errorLog: null,
          status: 'success',
          hasIssue: issues.length > 0,
        },
      });

      await tx.codeIssue.deleteMany({ where: { versionId } });

      if (issues.length > 0) {
        await tx.codeIssue.createMany({
          data: issues.map((issue) => ({
            versionId,
            codeAnalysisId: analysis.id,
            ...issue,
          })),
        });
      }
    });

    await updateVersionStatusSafely(versionId, {
      codeStatus: 'success',
    });
  } catch (e) {
    await prisma.codeAnalysis.upsert({
      where: { versionId },
      update: {
        errorLog: `Parsing or saving exception: ${String(e)}`,
        status: 'fail',
        hasIssue: false,
      },
      create: {
        versionId,
        errorLog: `Parsing or saving exception: ${String(e)}`,
        status: 'fail',
        hasIssue: false,
      },
    });

    await updateVersionStatusSafely(versionId, {
      codeStatus: 'fail',
      flowStatus: 'fail',
    });
  }
}
