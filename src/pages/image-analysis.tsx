import React from 'react';
import { useRouter } from 'next/router';

interface Vulnerability {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  package: string;
  version: string;
  description: string;
  affected: string;
}

const vulnerabilities: Vulnerability[] = [
  {
    id: 'CVE-2025-1234',
    severity: 'Critical',
    package: 'openssl',
    version: '1.1.1',
    description: 'Remote code execution vulnerability in OpenSSL',
    affected: 'Base image'
  },
  {
    id: 'CVE-2025-5678',
    severity: 'High',
    package: 'nginx',
    version: '1.18.0',
    description: 'Buffer overflow vulnerability in HTTP/2 implementation',
    affected: 'Web server'
  }
];

export default function ImageAnalysis() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/deployment-approval');
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
          <h1 className="main-title">Image Static Analysis Results</h1>
          <p className="main-subtitle">We found 2 high severity vulnerabilities in your dependencies. We recommend you review and address them as soon as possible</p>
          <section className="step-section">
            <div className="step-title">Vulnerability details</div>
            <div className="vulnerability-summary">
              <div className="summary-item critical">
                <span className="count">1</span>
                <span className="label">Critical</span>
              </div>
              <div className="summary-item high">
                <span className="count">1</span>
                <span className="label">High</span>
              </div>
            </div>
            <div className="vuln-list">
              {vulnerabilities.map((vuln, index) => (
                <div key={index} className="vuln-item">
                  <span className="vuln-icon">🛡️</span>
                  <div className="vuln-content">
                    <div className="vuln-header">
                      <span className={`severity-badge ${vuln.severity.toLowerCase()}`}>{vuln.severity}</span>
                      <span className="vuln-cve">{vuln.id}</span>
                    </div>
                    <div className="vuln-details">
                      <div className="package-info">
                        <strong>{vuln.package}</strong>@{vuln.version}
                      </div>
                      <div className="affected-component">
                        Affected: {vuln.affected}
                      </div>
                      <div className="description">
                        {vuln.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="action-buttons">
              <button className="next-btn" onClick={handleNext}>Next</button>
            </div>
          </section>
        </div>
      </main>
      <style jsx>{`
        .github-bg {
          min-height: 100vh;
          background: #161b22;
          color: #fff;
        }
        .github-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          height: 64px;
        }
        .github-logo {
          width: 32px;
          height: 32px;
          background: url('/github-mark-white.svg') no-repeat center/contain;
        }
        .github-header-right {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .github-nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .github-nav a {
          color: #c9d1d9;
          text-decoration: none;
          font-size: 15px;
        }
        .github-nav a:hover {
          color: #58a6ff;
        }
        .github-header-actions {
          display: flex;
          align-items: center;
          margin-left: 16px;
          gap: 4px;
        }
        .github-new-btn-blue {
          background: #2386f2;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 6px 16px;
          margin-right: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }
        .github-new-btn-blue:hover {
          background: #1c6ed2;
        }
        .github-icon-btn {
          background: transparent;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-right: 4px;
          transition: background 0.15s;
        }
        .github-icon-btn:hover {
          background: #21262d;
        }
        .main-container-flex {
          max-width: 1600px;
          min-height: 750px;
          margin: 64px auto 0 auto;
          background: #0d1117;
          border-radius: 16px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.3);
          padding: 56px 120px 64px 120px;
          display: flex;
          flex-direction: row;
          gap: 64px;
        }
        .main-content-left {
          flex: 2;
          min-width: 0;
        }
        .main-title {
          font-size: 2.2rem;
          font-weight: bold;
          margin-bottom: 8px;
          text-align: left;
        }
        .main-subtitle {
          color: #8b949e;
          margin-bottom: 32px;
          font-size: 1.05rem;
        }
        .step-section {
          margin-bottom: 16px;
        }
        .step-title {
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 16px;
        }
        .vulnerability-summary {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }
        .summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 24px;
          border-radius: 8px;
          background: #161b22;
        }
        .summary-item.critical {
          border: 1px solid #f85149;
        }
        .summary-item.high {
          border: 1px solid #f0883e;
        }
        .summary-item .count {
          font-size: 24px;
          font-weight: bold;
        }
        .summary-item.critical .count {
          color: #f85149;
        }
        .summary-item.high .count {
          color: #f0883e;
        }
        .summary-item .label {
          color: #8b949e;
          font-size: 14px;
        }
        .vuln-list {
          width: 100%;
          margin-bottom: 32px;
        }
        .vuln-item {
          display: flex;
          align-items: flex-start;
          background: #23272e;
          border-radius: 10px;
          padding: 14px 20px;
          margin-bottom: 14px;
        }
        .vuln-icon {
          font-size: 1.6rem;
          margin-right: 16px;
        }
        .vuln-content {
          flex: 1;
        }
        .vuln-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .severity-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .severity-badge.critical {
          background: #f85149;
          color: white;
        }
        .severity-badge.high {
          background: #f0883e;
          color: white;
        }
        .vuln-cve {
          color: #58a6ff;
          font-weight: 500;
          font-size: 1.13rem;
        }
        .vuln-details {
          color: #c9d1d9;
        }
        .package-info {
          margin-bottom: 4px;
        }
        .affected-component {
          color: #8b949e;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .description {
          font-size: 14px;
          line-height: 1.5;
        }
        .action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }
        .next-btn {
          margin-top: 12px;
          background: #2386f2;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 10px 32px;
          font-size: 1.1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }
        .next-btn:hover {
          background: #1c6ed2;
        }
      `}</style>
    </div>
  );
}