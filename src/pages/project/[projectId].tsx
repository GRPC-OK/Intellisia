'use client';

import React, { useState } from 'react';
import VersionList from '@/components/project-detail/VersionList';
import ProjectSidebar from '@/components/project-detail/ProjectSidebar';
import ProjectHeader from '@/components/project-detail/ProjectHeader';
import { VersionCardProps } from '@/components/project-detail/VersionCard';

const mockProject = {
  id: 1,
  name: 'admin_page',
  description: '관리자 용 애플리케이션.',
  githubUrl: 'https://github.com/GRPC-OK/GRPC-OK',
  domain: 'https://admin-access.kisia.or.kr',
  createdAt: '2024-03-20T00:00:00Z',
  updatedAt: '2024-03-20T00:00:00Z',
  createdBy: {
    id: 1,
    name: 'shw',
    email: 'hong@example.com',
    avatarUrl: '/img/default_project_img.png',
  },
  contributors: [
    {
      id: 2,
      name: 'kij',
      email: 'kim@example.com',
      avatarUrl: '/img/default_project_img.png',
    },
    {
      id: 3,
      name: 'adf',
      email: 'lee@example.com',
      avatarUrl: '/img/default_project_img.png',
    },
  ],
  versions: [
    { name: 'v1.1.0', description: '최신 배포 버전', isCurrent: true },
    { name: 'v1.0.0', description: '최초 릴리즈' },
  ],
};

export default function ProjectDetailPage() {
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const versions: VersionCardProps[] = [...mockProject.versions].sort((a, b) =>
    sort === 'newest'
      ? b.name.localeCompare(a.name)
      : a.name.localeCompare(b.name)
  );

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-[90rem] mx-auto px-6 py-10 flex gap-10 items-start">
        <main className="flex-1 min-w-0">
          {/* 헤더 표시 */}
          <ProjectHeader
            projectName={mockProject.name}
            creatorName={mockProject.createdBy.name}
          />

          {/* 정렬 탭 */}
          <div className="flex justify-end mb-8">
            <div className="flex border border-[#23272F] rounded-md overflow-hidden">
              <button
                className={`px-8 py-2 text-[1.1rem] border-r border-[#23272F] transition ${
                  sort === 'newest'
                    ? 'font-bold text-white bg-[#23272F]'
                    : 'text-[#b1b5bb]'
                }`}
                onClick={() => setSort('newest')}
              >
                Newest
              </button>
              <button
                className={`px-8 py-2 text-[1.1rem] transition ${
                  sort === 'oldest'
                    ? 'font-bold text-white bg-[#23272F]'
                    : 'text-[#b1b5bb]'
                }`}
                onClick={() => setSort('oldest')}
              >
                Oldest
              </button>
            </div>
          </div>

          {/* 버전 리스트 */}
          <VersionList versions={versions} />
        </main>

        {/* 사이드바 + 배포 버튼 */}
        <div className="flex flex-col min-w-0 flex-shrink-0 w-[20rem] gap-5">
          <div className="flex justify-end">
            <button className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-[1.13rem] rounded-xl px-6 py-2 transition">
              New Deployment
            </button>
          </div>
          <ProjectSidebar project={mockProject} />
        </div>
      </div>
    </div>
  );
}
