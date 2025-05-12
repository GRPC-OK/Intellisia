import React, { useState } from 'react';
import VersionList from '@/components/project-detail/VersionList';
import ProjectSidebar from '@/components/project-detail/ProjectSidebar';

// 임시 데이터
const mockProject = (() => {
  // 원본 데이터
  const base = {
    id: '1',
    name: '보안 자동화 플랫폼',
    description:
      '보안 작업을 자동화하고 효율적으로 관리할 수 있는 플랫폼입니다.',
    githubUrl: 'https://github.com/GRPC-OK/GRPC-OK',
    domain: 'https://admin-access.kisia.or.kr',
    createdAt: '2024-03-20T00:00:00Z',
    updatedAt: '2024-03-20T00:00:00Z',
    owner: {
      id: '1',
      name: '홍길동',
      email: 'hong@example.com',
      avatar: '/img/default_project_img.png',
    },
    contributors: [
      {
        id: '2',
        name: '김철수',
        email: 'kim@example.com',
        avatar: '/img/default_project_img.png',
      },
      {
        id: '3',
        name: '이영희',
        email: 'lee@example.com',
        avatar: '/img/default_project_img.png',
      },
    ],
    versions: [
      {
        id: '1',
        name: 'v1.0.0',
        description: '초기 버전',
        createdAt: '2024-03-20T00:00:00Z',
        updatedAt: '2024-03-20T00:00:00Z',
        createdBy: {
          id: '1',
          name: '홍길동',
          email: 'hong@example.com',
          avatar: '/img/default_project_img.png',
        },
      },
      {
        id: '2',
        name: 'v1.1.0',
        description: '버그 수정 및 기능 개선',
        createdAt: '2024-03-21T00:00:00Z',
        updatedAt: '2024-03-21T00:00:00Z',
        createdBy: {
          id: '2',
          name: '김철수',
          email: 'kim@example.com',
          avatar: '/img/default_project_img.png',
        },
      },
    ],
  };
  // 최신 버전만 isCurrent: true
  const versionsSorted = [...base.versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const versionsWithCurrent = versionsSorted.map((v, idx) => ({
    ...v,
    isCurrent: idx === 0,
  }));
  return { ...base, versions: versionsWithCurrent };
})();

export default function ProjectDetailPage() {
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  // 정렬 적용 (실제 데이터 연동 시 서버/클라에서 정렬)
  const sortedVersions = [...mockProject.versions].sort((a, b) => {
    if (sort === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0D1117' }}>
      <div
        style={{
          maxWidth: '90rem',
          margin: '0 auto',
          padding: '2.5rem 1.5rem',
          display: 'flex',
          gap: '2.5rem',
          alignItems: 'flex-start',
        }}
      >
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* 네비게이션 */}
          <div
            style={{
              fontSize: '1.18rem',
              color: '#b1b5bb',
              marginBottom: '1.5rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            comfyanonymous /{' '}
            <span
              style={{ color: '#58A6FF', fontWeight: 700, fontSize: '1.18rem' }}
            >
              admin-access
            </span>
          </div>
          {/* Newest/Oldest 탭 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                background: 'transparent',
                border: '1px solid #23272F',
                borderRadius: '0.5em',
                overflow: 'hidden',
              }}
            >
              <button
                style={{
                  padding: '0.5em 2em',
                  fontSize: '1.1rem',
                  fontWeight: sort === 'newest' ? 700 : 400,
                  color: sort === 'newest' ? 'white' : '#b1b5bb',
                  background: sort === 'newest' ? '#23272F' : 'transparent',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  borderRight: '1px solid #23272F',
                  transition: 'background 0.2s',
                }}
                onClick={() => setSort('newest')}
              >
                Newest
              </button>
              <button
                style={{
                  padding: '0.5em 2em',
                  fontSize: '1.1rem',
                  fontWeight: sort === 'oldest' ? 700 : 400,
                  color: sort === 'oldest' ? 'white' : '#b1b5bb',
                  background: sort === 'oldest' ? '#23272F' : 'transparent',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={() => setSort('oldest')}
              >
                Oldest
              </button>
            </div>
          </div>
          {/* 버전 카드 리스트 */}
          <VersionList versions={sortedVersions} onVersionClick={() => {}} />
        </main>
        {/* 오른쪽 사이드바 + 버튼 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '0 0 20rem',
            minWidth: 0,
            alignSelf: 'flex-start',
            height: 'auto',
            justifyContent: 'flex-start',
            gap: '1.2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              style={{
                background: '#238636',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.13rem',
                borderRadius: '0.7em',
                padding: '0.55em 1.5em',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
                boxShadow: '0 1px 2px 0 rgba(20,40,20,0.04)',
                letterSpacing: '-0.01em',
              }}
            >
              New Deployment
            </button>
          </div>
          <ProjectSidebar project={mockProject} />
        </div>
      </div>
    </div>
  );
}
