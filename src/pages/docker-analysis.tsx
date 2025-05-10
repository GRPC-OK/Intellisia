import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const statusSteps = [
  { label: 'Code Static Analysis', status: 'Approved', type: 'approved' },
  { label: 'Image Build', status: 'Approved', type: 'approved' },
  { label: 'Image Static Analysis', status: 'Pending', type: 'pending' },
  { label: 'Deployment Approval', status: 'Pending', type: 'pending' },
  { label: 'Deployment', status: 'Pending', type: 'pending' },
];

function VulnerabilityModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header className="modal-navbar">
          <div className="modal-navbar-left">
            <span className="modal-navbar-logo" />
            <span className="modal-navbar-title">Acme Co</span>
          </div>
          <nav className="modal-navbar-menu">
            <a>Dashboard</a>
            <a>Devices</a>
            <a>Rules</a>
            <a>Reports</a>
          </nav>
          <div className="modal-navbar-right">
            <div className="modal-navbar-search">
              <input type="text" placeholder="Search" />
            </div>
            <span className="modal-navbar-icon" title="Notifications">🔔</span>
            <span className="modal-navbar-icon" title="Chat">💬</span>
            <span className="modal-navbar-avatar" />
          </div>
        </header>
        <div className="modal-body">
          <div className="modal-title-large">Vulnerabilities found in your dependencies</div>
          <div className="modal-desc-large">We found 2 high severity vulnerabilities in your project. We recommend you review and address them as soon as possible</div>
          <div className="modal-section-title-large">Vulnerability details</div>
          <div className="modal-vuln-list-large">
            <div className="modal-vuln-item-large">
              <span className="modal-vuln-icon-large">🛡️</span>
              <div>
                <div className="modal-vuln-cve-large">CVE-2015-9251</div>
                <div className="modal-vuln-desc-large">High severity, npm:lodash, 4.17.21</div>
              </div>
            </div>
            <div className="modal-vuln-item-large">
              <span className="modal-vuln-icon-large">🛡️</span>
              <div>
                <div className="modal-vuln-cve-large">CVE-2015-9251</div>
                <div className="modal-vuln-desc-large">High severity, npm:lodash, 4.17.21</div>
              </div>
            </div>
          </div>
          <button className="modal-view-btn-large">View Details</button>
        </div>
      </div>
      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          left: 0; top: 0; width: 100vw; height: 100vh;
          background: #111618;
          z-index: 9999;
          display: flex; align-items: flex-start; justify-content: center;
        }
        .modal-content {
          background: transparent;
          width: 100vw;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .modal-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #181c20;
          height: 64px;
          padding: 0 32px;
          border-bottom: 1px solid #23272e;
        }
        .modal-navbar-left {
          display: flex; align-items: center; gap: 10px;
        }
        .modal-navbar-logo {
          width: 28px; height: 28px;
          background: #fff;
          border-radius: 50%;
          display: inline-block;
        }
        .modal-navbar-title {
          color: #fff;
          font-size: 1.25rem;
          font-weight: 700;
        }
        .modal-navbar-menu {
          display: flex; gap: 28px;
        }
        .modal-navbar-menu a {
          color: #c9d1d9;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
        }
        .modal-navbar-menu a:hover {
          color: #58a6ff;
        }
        .modal-navbar-right {
          display: flex; align-items: center; gap: 16px;
        }
        .modal-navbar-search input {
          background: #23272e;
          border: none;
          border-radius: 8px;
          padding: 6px 16px;
          color: #c9d1d9;
          font-size: 1rem;
          width: 140px;
        }
        .modal-navbar-icon {
          font-size: 1.3rem;
          color: #c9d1d9;
          margin-left: 8px;
          cursor: pointer;
        }
        .modal-navbar-avatar {
          width: 32px; height: 32px;
          background: #c9d1d9;
          border-radius: 50%;
          display: inline-block;
        }
        .modal-body {
          margin: 0 auto;
          margin-top: 64px;
          background: none;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 420px;
          max-width: 540px;
        }
        .modal-title-large {
          font-size: 2.2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }
        .modal-desc-large {
          color: #b3bfc9;
          font-size: 1.08rem;
          margin-bottom: 32px;
        }
        .modal-section-title-large {
          font-size: 1.15rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 16px;
        }
        .modal-vuln-list-large {
          width: 100%;
          margin-bottom: 32px;
        }
        .modal-vuln-item-large {
          display: flex;
          align-items: center;
          background: #23272e;
          border-radius: 10px;
          padding: 14px 20px;
          margin-bottom: 14px;
        }
        .modal-vuln-icon-large {
          font-size: 1.6rem;
          margin-right: 16px;
        }
        .modal-vuln-cve-large {
          color: #fff;
          font-size: 1.13rem;
          font-weight: 600;
        }
        .modal-vuln-desc-large {
          color: #b3bfc9;
          font-size: 1.01rem;
        }
        .modal-view-btn-large {
          width: 100%;
          background: #2386f2;
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 18px 0;
          font-size: 1.18rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}

export default function DockerAnalysis() {
  const router = useRouter();
  // const [modalOpen, setModalOpen] = useState(false);
  // const [modalStep, setModalStep] = useState('');

  const handleStepClick = (stepLabel: string) => {
    if (stepLabel === 'Code Static Analysis' || stepLabel === 'Image Static Analysis') {
      router.push('/vulnerabilities');
    } else if (stepLabel === 'Image Build') {
      router.push('/image-build');
    } else if (stepLabel === 'Deployment Approval') {
      router.push('/deployment-approval');
    } else if (stepLabel === 'Deployment') {
      router.push('/deployment');
    }
  };

  return (
    <>
      <Head>
        <title>Docker Image Vulnerability Analysis</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
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
            <h1 className="main-title">Docker Image Vulnerability Analysis</h1>
            <p className="main-subtitle">Analyze your Docker images for vulnerabilities. Requires a GitHub App installation</p>
            <section className="step-section">
              <div className="step-title">Step 1: Connect your repository</div>
              <div className="progress-bar">
                <div className="progress-bar-inner"></div>
              </div>
              <div className="step-desc">Connect the repository to scan your Docker images for vulnerabilities</div>
              <div className="step-actions">
                <button className="cancel-btn">Cancel</button>
                <button className="connect-btn">Connect</button>
              </div>
            </section>
            <div className="pipeline-outer-center">
              <div className="pipeline-horizontal-ui-flex">
                {statusSteps.map((step, idx) => (
                  <React.Fragment key={step.label}>
                    <div
                      className="pipeline-step-ui-flex-col"
                      style={{ cursor: (step.label === 'Code Static Analysis' || step.label === 'Image Static Analysis') ? 'pointer' : 'default' }}
                      onClick={() => handleStepClick(step.label)}
                    >
                      <div className={`pipeline-circle-ui-flex ${step.type}`}>
                        {step.type === 'approved' ? (
                          <span className="pipeline-check-flex">✔</span>
                        ) : (
                          <span className="pipeline-x-flex">✖</span>
                        )}
                      </div>
                      <div className="pipeline-label-ui-flex">{step.label}</div>
                      <div className={`pipeline-status-ui-flex ${step.type}`}>{step.status}</div>
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <span className="pipeline-arrow-wrap">
                        <svg className="pipeline-arrow" width="60" height="120" viewBox="0 0 60 120">
                          <line x1="0" y1="28" x2="50" y2="28" stroke={step.type === 'approved' ? '#238636' : '#222'} strokeWidth="4" />
                          <polygon points="50,16 60,28 50,40" fill={step.type === 'approved' ? '#238636' : '#222'} />
                        </svg>
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          <button className="detail-btn detail-btn-bottom-left">Detail</button>
        </main>
      </div>
      {/* {modalOpen && <VulnerabilityModal onClose={() => setModalOpen(false)} />} */}
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
        .status-list-right {
          display: none;
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
        }
        .progress-bar {
          background: #21262d;
          border-radius: 6px;
          height: 8px;
          margin: 12px 0 8px 0;
          width: 100%;
          overflow: hidden;
        }
        .progress-bar-inner {
          background: #238636;
          width: 60%;
          height: 100%;
        }
        .step-desc {
          color: #8b949e;
          font-size: 0.98rem;
          margin-bottom: 16px;
        }
        .step-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        .cancel-btn {
          background: #21262d;
          color: #c9d1d9;
          border: none;
          border-radius: 6px;
          padding: 8px 20px;
          font-size: 1rem;
          cursor: pointer;
        }
        .connect-btn {
          background: #238636;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 20px;
          font-size: 1rem;
          cursor: pointer;
        }
        .plan-info {
          display: none;
        }
        .status-list-vertical {
          list-style: none;
          padding: 0;
          margin: 0 0 24px 0;
        }
        .status-list-bottom {
          margin-top: 16px;
          margin-bottom: 24px;
        }
        .status-list-item {
          display: flex;
          align-items: flex-start;
          font-size: 1.05rem;
          margin-bottom: 8px;
        }
        .status-icon-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-right: 10px;
          min-width: 20px;
        }
        .status-icon {
          font-size: 1.2rem;
          font-weight: bold;
        }
        .status-icon.approved {
          color: #238636;
        }
        .status-icon.pending {
          color: #f85149;
        }
        .status-vertical-line {
          width: 2px;
          height: 24px;
          background: #30363d;
          margin: 2px 0 0 0;
        }
        .status-content {
          display: flex;
          flex-direction: row;
          align-items: center;
          width: 100%;
        }
        .status-label {
          color: #fff;
          font-size: 1.05rem;
          margin-right: 16px;
        }
        .status-state {
          font-size: 1.02rem;
          color: #8b949e;
        }
        .status-state.approved {
          color: #238636;
        }
        .status-state.pending {
          color: #f85149;
        }
        .detail-btn {
          background: #21262d;
          color: #c9d1d9;
          border: none;
          border-radius: 6px;
          padding: 10px 32px;
          font-size: 1.1rem;
          cursor: pointer;
          margin-top: 8px;
          width: 100%;
        }
        .pipeline-outer-center {
          width: 100%;
          display: flex;
          justify-content: center;
          margin: 96px 0 32px 0;
        }
        .pipeline-horizontal-ui-flex {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
        }
        .pipeline-step-ui-flex-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 140px;
          margin: 0 18px;
        }
        .pipeline-circle-ui-flex {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 8px solid #238636;
          background: #181c20;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4.8rem;
          font-weight: bold;
          z-index: 1;
          box-shadow: 0 0 0 2px #161b22;
        }
        .pipeline-circle-ui-flex.pending {
          border-color: #f85149;
        }
        .pipeline-check-flex {
          color: #238636;
          font-size: 4.8rem;
          font-weight: bold;
        }
        .pipeline-x-flex {
          color: #f85149;
          font-size: 4.8rem;
          font-weight: bold;
        }
        .pipeline-label-ui-flex {
          color: #fff;
          font-size: 1.18rem;
          margin-top: 18px;
          text-align: center;
          font-weight: 600;
          line-height: 1.2;
          max-width: 260px;
          word-break: keep-all;
          white-space: nowrap;
        }
        .pipeline-status-ui-flex {
          font-size: 1.15rem;
          margin-top: 4px;
          margin-bottom: 16px;
          text-align: center;
          color: #8b949e;
          font-weight: 500;
        }
        .pipeline-status-ui-flex.approved {
          color: #238636;
        }
        .pipeline-status-ui-flex.pending {
          color: #f85149;
        }
        .pipeline-arrow-wrap {
          display: flex;
          align-items: center;
          height: 120px;
        }
        .pipeline-arrow {
          display: block;
          height: 120px;
          width: 60px;
          margin: 0 8px;
          vertical-align: middle;
        }
        @media (max-width: 900px) {
          .main-container-flex {
            flex-direction: column;
            gap: 0;
            padding: 24px 8px 24px 8px;
          }
        }
        .detail-btn-bottom-left {
          position: absolute;
          left: 40px;
          bottom: 32px;
          width: 200px;
        }
      `}</style>
    </>
  );
} 