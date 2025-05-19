import prisma from '@/lib/prisma';
import { extractSemgrepIssues } from '@/utils/parseSarifSemgrep';
import { updateVersionStatusSafely } from '@/services/version-service/version-status-updater.service';
import { SarifCodeIssue, RawSarif } from '@/types/sarif';

export async function handleSemgrepResult(
  versionId: number,
  sarif: unknown,
  contentType?: string
) {
  const isJson = contentType?.includes('application/json');

  // 실패 로그 (text/plain) 처리
  if (!isJson) {
    const errorText = typeof sarif === 'string' ? sarif : JSON.stringify(sarif);

    await prisma.codeAnalysis.upsert({
      where: { versionId },
      update: {
        errorLog: errorText,
        status: 'fail',
        hasIssue: false,
      },
      create: {
        versionId,
        errorLog: errorText,
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

  // 성공 SARIF 처리
  try {
    const parsed = sarif as RawSarif;
    const issues: SarifCodeIssue[] = extractSemgrepIssues(parsed);

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

      // 기존 이슈 삭제
      await tx.codeIssue.deleteMany({
        where: { versionId },
      });

      // 새로운 이슈 저장
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
    const fallback =
      typeof sarif === 'object' ? JSON.stringify(sarif) : String(sarif);

    await prisma.codeAnalysis.upsert({
      where: { versionId },
      update: {
        errorLog: `SARIF 파싱 실패\n${fallback}\n예외: ${String(e)}`,
        status: 'fail',
        hasIssue: false,
      },
      create: {
        versionId,
        errorLog: `SARIF 파싱 실패\n${fallback}\n예외: ${String(e)}`,
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
