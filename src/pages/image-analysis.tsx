import React, { useEffect, useState } from 'react';
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
  const projectName = router.query.projectName as string | undefined;
  const versionId = router.query.versionId as string | undefined;

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

          {loading ? ( // ✅ 로딩 상태일 때 표시
            <p className="main-subtitle">Loading analysis results...</p>
          ) : (
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
          )}
        </div>
      </main>
    </div>
  );
}
