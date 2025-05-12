import React from 'react';
import { Project } from '@/types/project';
import Image from 'next/image';

interface ProjectHeaderProps {
  project: Project;
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <section className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-[#161B22] border border-[#30363D] rounded-xl px-8 py-7 mb-8">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
        <p className="text-gray-300 text-base mb-4">{project.description}</p>
        <div className="flex items-center gap-6 text-gray-400 text-sm">
          <div className="flex items-center gap-1">
            <Image
              src="/img/default_project_img.png"
              alt="icon"
              width={22}
              height={22}
            />
            <span className="ml-1">
              소유자: <span className="text-white">{project.owner.name}</span>
            </span>
          </div>
          <span>
            기여자:{' '}
            <span className="text-white">{project.contributors.length}명</span>
          </span>
          <span>
            버전:{' '}
            <span className="text-white">{project.versions.length}개</span>
          </span>
        </div>
      </div>
      <div className="flex flex-row gap-2 mt-2 md:mt-0 md:ml-8 shrink-0">
        <button className="bg-[#238636] hover:bg-[#2ea043] text-white font-semibold px-5 py-2 rounded-lg transition-colors">
          프로젝트 수정
        </button>
      </div>
    </section>
  );
}
