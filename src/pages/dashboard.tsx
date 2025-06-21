// src/pages/dashboard.tsx - 인증 적용 버전
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';

// 인증된 사용자의 프로젝트 데이터 타입
interface AuthenticatedProjectData {
  id: number;
  name: string;
  owner?: {
    name: string;
    id: number;
  };
  isOwner: boolean; // 현재 사용자가 소유자인지
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [projects, setProjects] = useState<AuthenticatedProjectData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 인증되지 않은 사용자 리디렉션
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
      return;
    }
  }, [status, router]);

  // 프로젝트 데이터 가져오기 (인증된 사용자만)
  useEffect(() => {
    if (status === 'authenticated' && session) {
      fetchAuthenticatedProjects();
    }
  }, [status, session]);

  const fetchAuthenticatedProjects = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/project/dashboard_projects', {
        method: 'GET',
        credentials: 'include', // 쿠키 포함
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // 인증 만료 - 로그인 페이지로 리디렉션
        await signOut({ callbackUrl: '/' });
        return;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        throw new Error(`프로젝트 목록을 가져오는 데 실패했습니다. (${response.status})`);
      }

      const data: AuthenticatedProjectData[] = await response.json();
      setProjects(data);
    } catch (err: unknown) {
      console.error('프로젝트 목록 가져오기 실패:', err);
      setError(
        err instanceof Error
          ? err.message
          : '프로젝트 목록을 가져오는 중 오류 발생'
      );
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewProject = () => {
    router.push('/create-project');
  };

  const handleProjectDetail = (name: string) => {
    router.push(`/project/${name}`);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const filteredProjects = projects.filter(proj =>
    proj.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 로딩 중 상태
  if (status === 'loading' || isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#181c23',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <div>대시보드를 로딩 중입니다...</div>
        </div>
      </div>
    );
  }

  // 인증되지 않은 상태
  if (status === 'unauthenticated') {
    return null; // useEffect에서 리디렉션 처리
  }

  // 오류 상태
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#181c23',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️ 오류 발생</div>
          <div className="mb-4">{error}</div>
          <button
            onClick={fetchAuthenticatedProjects}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#181c23', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더에 사용자 정보 추가 */}
      <header style={{
        background: '#0d1117',
        borderBottom: '1px solid #2e333d',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
          Intellisia 🥕
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {session?.user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt="프로필"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid #30363d'
                  }}
                />
              )}
              <span style={{ fontSize: '0.9rem', color: '#b0b8c1' }}>
                {session.user.name || session.user.email}
              </span>
            </div>
          )}

          <button
            onClick={handleSignOut}
            style={{
              background: '#21262d',
              color: '#c9d1d9',
              border: '1px solid #30363d',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main style={{
        flex: 1,
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem',
        width: '100%'
      }}>
        {/* 컨트롤 바 */}
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
              내 프로젝트
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
            {/* 검색 */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="프로젝트 검색..."
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

            {/* 뷰 토글 */}
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

        {/* 프로젝트 표시 */}
        {viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => handleProjectDetail(proj.name)}
                style={{
                  background: '#23272f',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent',
                  position: 'relative'
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
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}>
                      {proj.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {proj.isOwner && (
                    <span style={{
                      background: '#238636',
                      color: '#fff',
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: '500'
                    }}>
                      소유자
                    </span>
                  )}
                </div>

                <div>
                  <h3 style={{
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    margin: '0 0 0.5rem 0',
                    color: '#fff'
                  }}>
                    {proj.name}
                  </h3>

                  {proj.owner && (
                    <p style={{
                      fontSize: '0.85rem',
                      color: '#8b949e',
                      margin: 0
                    }}>
                      생성자: {proj.owner.name}
                    </p>
                  )}
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
                  padding: '1rem',
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
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{
                      fontWeight: '600',
                      fontSize: '1rem',
                      margin: 0,
                      color: '#fff'
                    }}>
                      {proj.name}
                    </h3>
                    {proj.isOwner && (
                      <span style={{
                        background: '#238636',
                        color: '#fff',
                        fontSize: '0.7rem',
                        padding: '1px 6px',
                        borderRadius: '8px',
                        fontWeight: '500'
                      }}>
                        소유자
                      </span>
                    )}
                  </div>

                  {proj.owner && (
                    <p style={{
                      fontSize: '0.8rem',
                      color: '#8b949e',
                      margin: 0
                    }}>
                      생성자: {proj.owner.name}
                    </p>
                  )}
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
            <p style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>
              {searchTerm ? '검색 결과가 없습니다.' : '아직 프로젝트가 없습니다.'}
            </p>
            {!searchTerm && (
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

        {/* 새 프로젝트 버튼 */}
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