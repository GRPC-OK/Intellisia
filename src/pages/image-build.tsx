import React from 'react';
import { useRouter } from 'next/router';

export default function ImageBuild() {
  const router = useRouter();
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
          <h1 className="main-title">Image Build Details</h1>
          <div className="build-card">
            <div><b>Image Tag:</b> my-app:1.0.3</div>
            <div><b>Build Time:</b> 2025-05-13 14:23:10</div>
            <div><b>Status:</b> <span className="build-success">Success</span></div>
            <div className="build-log-title"><b>Build Log:</b></div>
            <pre className="build-log">
Step 1/5 : FROM node:18-alpine
 {'-->'} 2c624b1
Step 2/5 : COPY . /app
 {'-->'} Using cache
Step 3/5 : RUN npm install
 {'-->'} Running in 1a2b3c
Step 4/5 : RUN npm run build
 {'-->'} Running in 1a2b3c
Step 5/5 : CMD ["node", "server.js"]
 {'-->'} Built successfully
            </pre>
          </div>
          <div className="next-btn-container">
  <button className="next-btn" onClick={() => router.push('/image-analysis')}>Next</button>
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
        .main-title { font-size: 2.2rem; font-weight: bold; margin-bottom: 24px; text-align: left; }
        .build-card { background: #181c20; border-radius: 12px; padding: 32px 28px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-size: 1.08rem; }
        .build-success { color: #238636; font-weight: bold; }
        .build-fail { color: #f85149; font-weight: bold; }
        .build-log-title { margin-top: 18px; margin-bottom: 6px; }
        .build-log { background: #23272e; color: #b3bfc9; border-radius: 8px; padding: 14px; font-size: 0.98rem; overflow-x: auto; }
        .next-btn-container {
  display: flex;
  justify-content: flex-end;
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