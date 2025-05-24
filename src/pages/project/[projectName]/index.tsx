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
    router.push(`/project/${project?.name}/version/${version.id}`);
  };

  return (
    <>
      <Head>
        <title>{project?.name ?? 'Project'} - Project Detail</title>
      </Head>

      <div className="flex flex-col md:flex-row gap-6 px-6 py-8 max-w-7xl mx-auto">
        <div className="flex-1 flex flex-col gap-6">
          {projectLoading ? (
            <div className="text-white">Loading project...</div>
          ) : (
            <>
              <ProjectHeader
                projectName={project!.name}
                creatorName={project!.owner.name}
              />

              <div className="flex justify-end">
                <SortControl sort={sort} setSort={setSort} />
              </div>

              {versionsLoading ? (
                <div className="text-white">Loading versions...</div>
              ) : (
                <VersionList
                  versions={versions}
                  onVersionClick={handleVersionClick}
                />
              )}
            </>
          )}
        </div>

        <div className="w-full md:w-80 shrink-0">
          {project && <ProjectSidebar project={project} />}
        </div>
      </div>
    </>
  );
}
