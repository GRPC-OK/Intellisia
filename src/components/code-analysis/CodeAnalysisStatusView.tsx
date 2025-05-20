import CodeIssueList from './CodeIssueList';
import CodeAnalysisErrorLog from './CodeAnalysisErrorLog';
import type { CodeIssue } from '@/types/code-analysis';

interface Props {
  status: 'success' | 'fail';
  issues: CodeIssue[];
  hasIssue: boolean;
  errorLog: string | null;
  onIssueClick: (issue: CodeIssue) => void;
}

export default function CodeAnalysisStatusView({
  status,
  issues,
  hasIssue,
  errorLog,
  onIssueClick,
}: Props) {
  if (status === 'fail') {
    return errorLog ? (
      <CodeAnalysisErrorLog log={errorLog} />
    ) : (
      <div className="text-red-400 text-sm">분석 실패. 에러 로그 없음</div>
    );
  }

  if (status === 'success') {
    return hasIssue ? (
      <CodeIssueList issues={issues} onIssueClick={onIssueClick} />
    ) : (
      <div className="text-[#8b949e] text-sm">탐지된 보안 이슈가 없습니다.</div>
    );
  }

  return null;
}
