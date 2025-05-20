import { Contributor } from './project';

export interface CodeIssue {
  id: number;
  message: string;
  ruleId: string;
  severity: 'error' | 'warning' | 'info' | null;
}

export interface CodeAnalysisResult {
  version: {
    name: string;
    project: {
      name: string;
      owner: Contributor;
    };
  };
  status: 'success' | 'fail';
  hasIssue?: boolean;
  errorLog?: string;
  issues?: CodeIssue[];
}
