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

  useEffect(() => {
    if (typeof projectName !== 'string') return;

    const fetchProject = async () => {
      setProjectLoading(true);
      const res = await fetch(`/api/project/${projectName}`);
      const data = await res.json();
      setProject(data);
      setProjectLoading(false);
    };

    fetchProject();
  }, [projectName]);

  useEffect(() => {
    if (!project?.id) return;

    const fetchVersions = async () => {
      setVersionsLoading(true);
      const res = await fetch(
        `/api/versions?projectId=${project.id}&sort=${sort}`
      );
      const data = await res.json();
      setVersions(data);
      setVersionsLoading(false);
    };

    fetchVersions();
  }, [project?.id, sort]);

  const handleVersionClick = (version: VersionSummary) => {
    router.push(`/project/${project!.name}/version/${version.id}`);
  };

  const handleNewDeploy = () => {
    router.push(`/project/${project!.name}/prepare-run`);
  };

  return (
    <>
      <Head>
        <title>{project?.name ?? 'Project'} - Project Detail</title>
      </Head>

      <div className="min-h-screen bg-[#0D1117] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {projectLoading ? (
            <div className="text-white">Loading project...</div>
          ) : (
            <>
              {/* 헤더 영역 - 프로젝트명과 New Deployment 버튼 */}
              <div className="flex items-center justify-between mb-6">
                <ProjectHeader
                  projectName={project!.name}
                  creatorName={project!.owner.name}
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
                    <div className="text-white">Loading versions...</div>
                  ) : (
                    <VersionList
                      versions={versions}
                      onVersionClick={handleVersionClick}
                    />
                  )}
                </div>

                {/* 사이드바 영역 */}
                <div className="w-80 shrink-0">
                  {project && <ProjectSidebar project={project} />}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
