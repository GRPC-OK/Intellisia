// src/pages/project/[projectName]/index.tsx - 안전장치 추가 버전
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { ProjectDetail, VersionSummary } from '@/types/project';
import ProjectSidebar from '@/components/project-detail/ProjectSidebar';
import ProjectHeader from '@/components/project-detail/ProjectHeader';
import VersionList from '@/components/project-detail/VersionList';
import SortControl from '@/components/project-detail/SortControl';
import NewDeploymentButton from '@/components/project-detail/NewDeploymentButton';

export default function ProjectDetailPage() {
  const router = useRouter();
  const { projectName } = router.query;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [sort, setSort] = useState<'newest' | 'oldest'>('oldest');

  const [projectLoading, setProjectLoading] = useState(true);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof projectName !== 'string') return;

    const fetchProject = async () => {
      setProjectLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/project/${projectName}`);

        if (!res.ok) {
          if (res.status === 404) {
            setError('프로젝트를 찾을 수 없습니다.');
          } else if (res.status === 500) {
            const errorData = await res.json();
            if (errorData.code === 'MISSING_OWNER') {
              setError('프로젝트 소유자 정보가 누락되었습니다. 관리자에게 문의하세요.');
            } else {
              setError('프로젝트 정보를 불러오는 중 오류가 발생했습니다.');
            }
          } else {
            setError(`오류가 발생했습니다 (${res.status})`);
          }
          return;
        }

        const data = await res.json();

        // ✅ 데이터 검증
        if (!data.owner) {
          console.error('[Project Detail] Missing owner in response:', data);
          setError('프로젝트 소유자 정보가 없습니다.');
          return;
        }

        setProject(data);
      } catch (err) {
        console.error('[Project Detail] Fetch error:', err);
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setProjectLoading(false);
      }
    };

    fetchProject();
  }, [projectName]);

  useEffect(() => {
    if (!project?.id) return;

    const fetchVersions = async () => {
      setVersionsLoading(true);
      try {
        const res = await fetch(
          `/api/versions?projectId=${project.id}&sort=${sort}`
        );

        if (res.ok) {
          const data = await res.json();
          setVersions(data);
        } else {
          console.error('[Versions] Fetch failed:', res.status);
        }
      } catch (err) {
        console.error('[Versions] Fetch error:', err);
      } finally {
        setVersionsLoading(false);
      }
    };

    fetchVersions();
  }, [project?.id, sort]);

  const handleVersionClick = (version: VersionSummary) => {
    router.push(`/project/${project!.name}/version/${version.id}`);
  };

  const handleNewDeploy = () => {
    router.push(`/project/${project!.name}/prepare-run`);
  };

  // ✅ 에러 상태 처리
  if (error) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">오류 발생</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              새로고침
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              대시보드로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{project?.name ?? 'Project'} - Project Detail</title>
      </Head>

      <div className="min-h-screen bg-[#0D1117] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {projectLoading ? (
            <div className="text-white flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <div>프로젝트 정보를 불러오는 중...</div>
              </div>
            </div>
          ) : project ? (
            <>
              {/* 헤더 영역 - 프로젝트명과 New Deployment 버튼 */}
              <div className="flex items-center justify-between mb-6">
                <ProjectHeader
                  projectName={project.name}
                  creatorName={project.owner?.name || 'Unknown User'} // ✅ 안전장치
                />
                <NewDeploymentButton
                  onClick={handleNewDeploy}
                  label="New Deployment"
                />
              </div>

              {/* 구분선 */}
              <hr className="border-t border-[#30363D] mb-6" />

              {/* 메인 콘텐츠와 사이드바 */}
              <div className="flex gap-8">
                {/* 메인 콘텐츠 영역 */}
                <div className="flex-1">
                  {/* 정렬 컨트롤 */}
                  <div className="flex justify-end mb-4">
                    <SortControl sort={sort} setSort={setSort} />
                  </div>

                  {/* 버전 목록 */}
                  {versionsLoading ? (
                    <div className="text-white text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                      <div>버전 목록을 불러오는 중...</div>
                    </div>
                  ) : (
                    <VersionList
                      versions={versions}
                      onVersionClick={handleVersionClick}
                    />
                  )}
                </div>

                {/* 사이드바 영역 */}
                <div className="w-80 shrink-0">
                  <ProjectSidebar project={project} />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}