import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
}

export default function DeploymentApproval() {
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);

  // 승인 버튼 클릭 핸들러
  const router = useRouter();

  const handleApprove = async () => {
    setIsProcessing(true);
    // TODO: API 연동 필요 시 여기에 추가
    setApprovalStatus('approved');
    setIsProcessing(false);
    router.push('/deployment');
  };
  // 거부 버튼 클릭 핸들러
  const handleReject = async () => {
    setIsProcessing(true);
    // TODO: API 연동 필요 시 여기에 추가
    setApprovalStatus('rejected');
    setIsProcessing(false);
    router.push('/deployment');
  };

  return (
    <div className="github-bg">
      <header className="github-header">
        <div className="github-logo"></div>
        <div className="github-header-right">
          <nav className="github-nav">
            <a href="#">Pull requests</a>
            <a href="#">Issues</a>
            <a href="#">Marketplace</a>
            <a href="#">Explore</a>
          </nav>
          <div className="github-header-actions">
            <button className="github-new-btn-blue">New</button>
            <button className="github-icon-btn" title="Notifications">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18c1.1 0 2-.9 2-2H8c0 1.1.9 2 2 2zm6-4V9c0-3.07-1.63-5.64-5-6.32V2a1 1 0 10-2 0v.68C5.63 3.36 4 5.92 4 9v5l-1 1v1h14v-1l-1-1zm-2 1H6v-6c0-2.48 1.51-4 4-4s4 1.52 4 4v6z" fill="#c9d1d9"/>
              </svg>
            </button>
            <button className="github-icon-btn" title="Add">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="9" stroke="#c9d1d9" strokeWidth="2" fill="none"/>
                <rect x="9" y="5" width="2" height="10" rx="1" fill="#c9d1d9"/>
                <rect x="5" y="9" width="10" height="2" rx="1" fill="#c9d1d9"/>
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main className="main-container-flex" style={{ position: 'relative' }}>
        <div className="main-content-left">
          <h1 className="main-title">Deployment Approval Details</h1>
          <div className="approval-card">
            <div><b>Requested By:</b> 민선재 </div>
            <div><b>Requested At:</b> 2025-05-13 15:10:22</div>
            <div><b>Status:</b> {approvalStatus === 'pending' && <span className="approval-pending">Pending</span>}
              {approvalStatus === 'approved' && <span className="approval-approved">Approved</span>}
              {approvalStatus === 'rejected' && <span className="approval-rejected">Rejected</span>}
            </div>
            <div className="approval-comment-title"><b>Comment:</b></div>
            <div className="approval-comment">배포 승인 요청드립니다. 변경사항은 보안 패치입니다.</div>
            <div style={{ marginTop: 20, display: 'flex', gap: 16 }}>
              <button
                className="github-new-btn-blue"
                onClick={handleApprove}
                disabled={approvalStatus !== 'pending' || isProcessing}
                style={{ minWidth: 100 }}
              >
                Approve
              </button>
              <button
                className="comment-action-btn delete"
                onClick={handleReject}
                disabled={approvalStatus !== 'pending' || isProcessing}
                style={{ minWidth: 100 }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </main>
      <style jsx>{`
        .github-bg { min-height: 100vh; background: #161b22; color: #fff; }
        .github-header { display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 64px; }
        .github-logo { width: 32px; height: 32px; background: url('/github-mark-white.svg') no-repeat center/contain; }
        .github-header-right { display: flex; align-items: center; gap: 32px; }
        .github-nav { display: flex; align-items: center; gap: 24px; }
        .github-nav a { color: #c9d1d9; text-decoration: none; font-size: 15px; }
        .github-nav a:hover { color: #58a6ff; }
        .github-header-actions { display: flex; align-items: center; margin-left: 16px; gap: 4px; }
        .github-new-btn-blue { background: #2386f2; color: #fff; border: none; border-radius: 6px; padding: 6px 16px; margin-right: 8px; font-size: 15px; font-weight: 500; cursor: pointer; transition: background 0.15s; }
        .github-new-btn-blue:hover { background: #1c6ed2; }
        .github-icon-btn { background: transparent; border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-right: 4px; transition: background 0.15s; }
        .github-icon-btn:hover { background: #21262d; }
        .main-container-flex { max-width: 1600px; min-height: 750px; margin: 64px auto 0 auto; background: #0d1117; border-radius: 16px; box-shadow: 0 2px 16px rgba(0,0,0,0.3); padding: 56px 120px 64px 120px; display: flex; flex-direction: row; gap: 64px; }
        .main-content-left { flex: 2; min-width: 0; }
        .main-content-right { flex: 1; min-width: 0; }
        .main-title { font-size: 2.2rem; font-weight: bold; margin-bottom: 24px; text-align: left; }
        .approval-card { background: #181c20; border-radius: 12px; padding: 32px 28px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-size: 1.08rem; }
        .approval-pending { color: #f85149; font-weight: bold; }
        .approval-approved { color: #238636; font-weight: bold; }
        .approval-rejected { color: #f85149; font-weight: bold; }
        .approval-comment-title { margin-top: 18px; margin-bottom: 6px; }
        .approval-comment { background: #23272e; color: #b3bfc9; border-radius: 8px; padding: 14px; font-size: 0.98rem; }
        .approval-analysis-guide {
          margin-bottom: 18px;
          color: #b3bfc9;
          font-size: 1.08rem;
          background: #23272e;
          border-radius: 8px;
          padding: 12px 18px;
        }
          padding: 4px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .comment-action-btn.edit {
          color: #58a6ff;
        }
        .comment-action-btn.edit:hover {
          background: #1c6ed2;
          border-color: #1c6ed2;
          color: #fff;
        }
        .comment-action-btn.delete {
          color: #f85149;
        }
        .comment-action-btn.delete:hover {
          background: #f85149;
          border-color: #f85149;
          color: #fff;
        }
        .comment-edit {
          margin-top: 12px;
        }
        .comment-edit-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
          justify-content: flex-end;
        }
        .comment-edit-btn {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .comment-edit-btn.save {
          background: #238636;
          color: #fff;
          border: none;
        }
        .comment-edit-btn.save:hover:not(:disabled) {
          background: #2ea043;
        }
        .comment-edit-btn.save:disabled {
          background: #30363d;
          cursor: not-allowed;
        }
        .comment-edit-btn.cancel {
          background: transparent;
          color: #c9d1d9;
          border: 1px solid #30363d;
        }
        .comment-edit-btn.cancel:hover {
          background: #30363d;
        }
        .analysis-section {
          margin-top: 32px;
        }
        .vulnerability-summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .count {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .label {
          color: #8b949e;
          font-size: 0.9rem;
        }
        .vuln-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .vuln-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .vuln-icon {
          font-size: 1.5rem;
          color: #58a6ff;
        }
        .vuln-content {
          flex: 1;
        }
        .vuln-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .severity-badge {
          padding: 2px 8px;
          border-radius: 4px;
          background: #23272e;
          color: #c9d1d9;
          font-size: 0.9rem;
        }
        .vuln-cve {
          color: #8b949e;
          font-size: 0.9rem;
        }
        .vuln-details {
          display: flex;
          flex-direction: column;
        }
        .file-info {
          margin-bottom: 4px;
        }
        .line-number {
          color: #8b949e;
          font-size: 0.9rem;
        }
        .vuln-type {
          margin-bottom: 4px;
        }
        .package-info {
          margin-bottom: 4px;
        }
        .affected-component {
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
} 