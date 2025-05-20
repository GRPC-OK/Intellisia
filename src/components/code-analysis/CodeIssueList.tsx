import CodeIssueCard from './CodeIssueCard';
import type { CodeIssue } from '@/types/code-analysis';

interface CodeIssueListProps {
  issues: CodeIssue[];
  onIssueClick?: (issue: CodeIssue) => void;
}

export default function CodeIssueList({
  issues,
  onIssueClick,
}: CodeIssueListProps) {
  return (
    <div className="flex flex-col gap-4">
      {issues.map((issue) => (
        <CodeIssueCard key={issue.id} issue={issue} onClick={onIssueClick} />
      ))}
    </div>
  );
}
