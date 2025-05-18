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

    await prisma.codeAnalysis.create({
      data: {
        versionId,
        errorLog: errorText, // 직접 DB에 실패 로그 저장
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
      await tx.codeAnalysis.create({
        data: {
          versionId,
          errorLog: null,
          ...(issues.length > 0 && {
            issues: { createMany: { data: issues } },
          }),
        },
      });
    });

    await updateVersionStatusSafely(versionId, {
      codeStatus: 'success',
    });
  } catch (e) {
    const fallback =
      typeof sarif === 'object' ? JSON.stringify(sarif) : String(sarif);

    await prisma.codeAnalysis.create({
      data: {
        versionId,
        errorLog: `SARIF 파싱 실패\n${fallback}\n예외: ${String(e)}`, // 실패 메시지 직접 저장
      },
    });

    await updateVersionStatusSafely(versionId, {
      codeStatus: 'fail',
      flowStatus: 'fail',
    });
  }
}
