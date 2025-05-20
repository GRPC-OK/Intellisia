import type { CodeIssue } from '@/types/code-analysis';

export interface CodeIssueCardProps {
  issue: CodeIssue;
  onClick?: (issue: CodeIssue) => void;
}

export default function CodeIssueCard({ issue, onClick }: CodeIssueCardProps) {
  const badgeColor =
    issue.severity === 'error'
      ? 'bg-red-500'
      : issue.severity === 'warning'
        ? 'bg-yellow-500'
        : issue.severity === 'info'
          ? 'bg-blue-500'
          : 'bg-gray-600';

  return (
    <div
      onClick={() => onClick?.(issue)}
      className="bg-[#161b22] border border-[#30363d] rounded-md p-4 cursor-pointer hover:bg-[#1f242d] transition"
    >
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm text-white font-medium">{issue.ruleId}</p>
        <span
          className={`text-xs text-black font-semibold px-2 py-0.5 rounded ${badgeColor}`}
        >
          {issue.severity ?? 'unknown'}
        </span>
      </div>
      <p className="text-sm text-[#b1b5bb]">{issue.message}</p>
    </div>
  );
}
