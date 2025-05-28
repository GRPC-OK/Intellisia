import React, { useEffect, useState} from 'react';
import { useRouter } from 'next/router';

interface Vulnerability {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  package: string;
  version: string;
  description: string;
  affected: string;
}

export default function ImageAnalysis() {
  const router = useRouter();

  const { projectName, versionId } = router.query;

  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectName || !versionId) return;

    const fetchAnalysis = async () => {
      try {
        const res = await fetch(`/api/build-and-scan/image-analysis?projectName=${projectName}&versionId=${versionId}`);
        if (!res.ok) throw new Error('Failed to fetch analysis data');
        const data = await res.json();
        setVulnerabilities(data.vulnerabilities || []);
      } catch (err) {
        console.error('[ImageAnalysis] fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [projectName, versionId]);

  const handleNext = () => {
    router.push(`/project/${projectName}/version/${versionId}/deployment-approval`);
  };

  return (
    <div className="github-bg">
       <main className="main-container-flex" style={{ position: 'relative' }}>
        <div className="main-content-left">
          <h1 className="main-title">Image Static Analysis Results</h1>
            <>
              <p className="main-subtitle">
                We found {vulnerabilities.length} vulnerabilities in your dependencies. We recommend you review and address them as soon as possible.
              </p>

              <section className="step-section">
                <div className="step-title">Vulnerability details</div>
                <div className="vulnerability-summary">
                  <div className="summary-item critical">
                    <span className="count">{vulnerabilities.filter(v => v.severity === 'Critical').length}</span>
                    <span className="label">Critical</span>
                  </div>
                  <div className="summary-item high">
                    <span className="count">{vulnerabilities.filter(v => v.severity === 'High').length}</span>
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
            </>
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