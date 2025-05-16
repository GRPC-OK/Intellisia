'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { ProjectDetail, VersionSummary } from '@/types/project';
import ProjectSidebar from '@/components/project-detail/ProjectSidebar';
import ProjectHeader from '@/components/project-detail/ProjectHeader';
import VersionList from '@/components/project-detail/VersionList';
import SortControl from '@/components/project-detail/SortControl';

export default function ProjectDetailPage() {
  const router = useRouter();
  const { projectId } = router.query;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [sort, setSort] = useState<'newest' | 'oldest'>('oldest');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}?sort=${sort}`);
      const data = await res.json();
      setProject(data);
      setVersions(data.versions);
      setLoading(false);
    };

    fetchProject();
  }, [projectId, sort]);

  const handleVersionClick = (version: VersionSummary) => {
    router.push(`/version/${version.name}`);
  };

  if (!project) return <div className="p-6 text-white">Loading...</div>;

  return (
    <>
      <Head>
        <title>{project.name} - Project Detail</title>
      </Head>

      <div className="flex flex-col md:flex-row gap-6 px-6 py-8 max-w-7xl mx-auto">
        {/* Left side */}
        <div className="flex-1 flex flex-col gap-6">
          <ProjectHeader
            projectName={project.name}
            creatorName={project.createdBy.name}
          />

          {/* 버튼 오른쪽 정렬 */}
          <div className="flex justify-end">
            <SortControl sort={sort} setSort={setSort} />
          </div>

          {loading ? (
            <div className="text-white">Loading versions...</div>
          ) : (
            <VersionList
              versions={versions}
              onVersionClick={handleVersionClick}
            />
          )}
        </div>

        {/* Right side */}
        <div className="w-full md:w-80 shrink-0">
          <ProjectSidebar project={project} />
        </div>
      </div>
    </>
  );
}
