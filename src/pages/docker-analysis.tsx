import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const statusSteps = [
  { label: 'Code Static Analysis' },
  { label: 'Image Build' },
  { label: 'Image Static Analysis' },
  { label: 'Deployment Approval' },
  { label: 'Deployment' },
];

export default function DockerAnalysis() {
  const router = useRouter();

  const handleStepClick = (stepLabel: string) => {
    if (stepLabel === 'Code Static Analysis') {
      router.push('/code-analysis');
    } else if (stepLabel === 'Image Static Analysis') {
      router.push('/image-analysis');
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
        </header>
        <main className="main-container-flex" style={{ position: 'relative' }}>
          <div className="main-content-left">

            <div className="pipeline-outer-center">
              <div className="pipeline-horizontal-ui-flex">
                {statusSteps.map((step, idx) => (
                  <React.Fragment key={step.label}>
                    <div
                      className="pipeline-step-ui-flex-col"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleStepClick(step.label)}
                    >
                      <div className="pipeline-circle-ui-flex">
                        <div></div>
                      </div>
                      <div className="pipeline-label-ui-flex">{step.label}</div>
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <span className="pipeline-arrow-wrap">
                        <svg className="pipeline-arrow" width="60" height="140" viewBox="0 -30 60 160">
                          <line x1="0" y1="-4" x2="50" y2="-4" stroke="#222" strokeWidth="4" />
                          <polygon points="50,-12 60,-4 50,4" fill="#222" />
                        </svg>
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          

        </main>
      </div>
      <style jsx>{`
        .github-bg {
          min-height: 100vh;
          background: #161b22;
          color: #fff;
        }


        .main-container-flex {
          max-width: 1600px;
          min-height: 750px;
          margin: 64px auto 0 auto;
          background: #0d1117;
          border-radius: 16px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.3);
          padding: 56px 120px 64px 120px;
        }

        .pipeline-outer-center {
          width: 100%;
          display: flex;
          justify-content: center;
          margin: 96px 0 32px 0;
        }
        .pipeline-horizontal-ui-flex {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 0;
          margin-top: 150px;
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
          background: #181c20;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          box-shadow: 0 0 0 2px #161b22;
          margin-bottom: 32px;
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
          }
        }
      `}</style>
    </>
  );
} 