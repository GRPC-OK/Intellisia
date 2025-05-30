// src/pages/dashboard.tsx
import React, { useEffect, useState } from 'react'; // useState, useEffect 임포트
import { useRouter } from 'next/router';

// DB에서 가져올 프로젝트 데이터의 타입을 정의합니다. (백엔드 API 응답 타입과 일치)
interface ProjectData {
  id: number; // DB ID (고유 키로 사용)
  name: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 프로젝트 등록(생성) 버튼 클릭 시 템플릿 페이지로 이동하는 함수
  const handleNewProject = () => {
    router.push('/create-project'); // '/create-project' 페이지로 이동
  };

  // 프로젝트 목록 상태 관리 (초기값 빈 배열)
  const [project, setProjects] = useState<ProjectData[]>([]);
  // 데이터 로딩 상태 관리
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // 오류 상태 관리
  const [error, setError] = useState<string | null>(null);

  // 검색 필터링된 프로젝트 목록
  const filteredProjects = project.filter(proj =>
    proj.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 컴포넌트가 마운트될 때 (페이지 로딩 시) API 호출하여 데이터 가져오기
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true); // 로딩 시작
      setError(null); // 오류 초기화

      try {
        // TODO: 백엔드 API 라우트 URL로 변경
        const response = await fetch('/api/project/dashboard_projects', {
          // 백엔드 API 호출
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 필요한 경우 인증 헤더 추가
          },
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(
            `HTTP error! status: ${response.status}, body: ${errorBody}`
          );
          throw new Error(
            `프로젝트 목록을 가져오는 데 실패했습니다. 상태 코드: ${response.status}`
          );
        }

        // API 응답 데이터 파싱 (ProjectData[] 타입)
        const data: ProjectData[] = await response.json();
        setProjects(data); // 프로젝트 목록 상태 업데이트
      } catch (err: unknown) {
        console.error('프로젝트 목록 가져오기 실패:', err);
        setError(
          err instanceof Error
            ? err.message
            : '프로젝트 목록을 가져오는 중 오류 발생'
        );
        setProjects([]); // 오류 발생 시 목록 비우기
      } finally {
        setIsLoading(false); // 로딩 종료
      }
    };

    fetchProjects(); // API 호출 함수 실행
  }, []); // 의존성 배열이 비어 있으므로 컴포넌트가 처음 마운트될 때만 실행

  const handleProjectDetail = (name: string) => {
    router.push(`/project/${name}`); // '/project/[name]' 페이지로 이동
  };

  // 로딩 중 상태 표시
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#181c23', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>프로젝트 목록을 로딩 중입니다...</div>
      </div>
    );
  }

  // 오류 상태 표시
  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#181c23', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>오류: {error}</div>
      </div>
    );
  }

  // 프로젝트 목록 데이터를 사용하여 UI 렌더링
  return (
    <div style={{ minHeight: '100vh', background: '#181c23', color: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* Main Content */}
      <main style={{
        flex: 1,
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem',
        width: '100%'
      }}>
        {/* Control Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: '0 0 0.5rem 0'
            }}>
              Current Project
            </h1>
            <p style={{
              color: '#b0b8c1',
              fontSize: '0.9rem',
              margin: 0
            }}>
              {filteredProjects.length}개의 프로젝트
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '200px',
                  padding: '8px 12px',
                  background: '#23272f',
                  border: '1px solid #2e333d',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* View Toggle */}
            <div style={{
              display: 'flex',
              background: '#23272f',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid #2e333d'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 12px',
                  background: viewMode === 'grid' ? '#2563eb' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                격자
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '6px 12px',
                  background: viewMode === 'list' ? '#2563eb' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                목록
              </button>
            </div>
          </div>
        </div>

        {/* Projects Display */}
        {viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => handleProjectDetail(proj.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#23272f',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2a2e37';
                  e.currentTarget.style.borderColor = '#2e333d';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#23272f';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={{
                  width: '35px',
                  height: '35px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.75rem',
                  flexShrink: 0
                }}>
                  <span style={{
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    {proj.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {proj.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: '#23272f',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #2e333d'
          }}>
            {filteredProjects.map((proj, index) => (
              <div
                key={proj.id}
                onClick={() => handleProjectDetail(proj.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  borderBottom: index < filteredProjects.length - 1 ? '1px solid #2e333d' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a2e37';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.75rem',
                  flexShrink: 0
                }}>
                  <span style={{
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                  }}>
                    {proj.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {proj.name}
                  </h3>
                </div>

                <svg
                  style={{
                    width: '16px',
                    height: '16px',
                    color: '#b0b8c1',
                    flexShrink: 0
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div style={{
            background: '#23272f',
            borderRadius: '8px',
            padding: '3rem 2rem',
            textAlign: 'center',
            color: '#b0b8c1',
            border: '1px solid #2e333d'
          }}>
            <p style={{ margin: 0, fontSize: '1rem' }}>
              {searchTerm ? '검색 결과가 없습니다.' : '프로젝트가 없습니다.'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleNewProject}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  marginTop: '1rem',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#2563eb';
                }}
              >
                첫 번째 프로젝트 만들기
              </button>
            )}
          </div>
        )}

        {/* Create New Project Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '3rem'
        }}>
          <button
            onClick={handleNewProject}
            style={{
              background: '#2563eb',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2563eb';
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 프로젝트
          </button>
        </div>
      </main>
    </div>
  );
}
