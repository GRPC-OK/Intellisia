import Link from 'next/link';
import ContributorsAvatars from './ContributorsAvatars';
import { Project } from '@/types/project';
import { format, formatDistanceToNow } from 'date-fns';

interface ProjectSidebarProps {
  project: Project;
}

function formatDate(dateStr: string) {
  return format(new Date(dateStr), 'yyyy.MM.dd HH:mm');
}

function formatRelative(dateStr: string) {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export default function ProjectSidebar({ project }: ProjectSidebarProps) {
  return (
    <aside className="w-full md:max-w-sm shrink-0 rounded-2xl border border-[#30363D] bg-[#161B22] px-6 py-5 flex flex-col gap-5 text-white">
      <div className="text-xl font-bold tracking-tight leading-snug">
        {project.name}
      </div>

      <section className="flex flex-col gap-1">
        <h3 className="text-sm text-gray-400 font-medium">project</h3>
        <p className="text-base text-gray-200 leading-relaxed">
          {project.description}
        </p>
      </section>

      <div className="border-t border-[#30363D]" />

      <section className="flex flex-col gap-1">
        <h3 className="text-sm text-gray-400 font-medium">Github link</h3>
        <Link
          href={project.githubUrl}
          target="_blank"
          className="text-sm text-[#58A6FF] underline break-all"
        >
          {project.githubUrl}
        </Link>
      </section>

      <div className="border-t border-[#30363D]" />

      <section className="flex flex-col gap-2">
        <h3 className="text-sm text-gray-400 font-medium">
          {project.contributors.length} participants
        </h3>
        <ContributorsAvatars contributors={project.contributors} size={38} />
      </section>

      <div className="border-t border-[#30363D]" />

      <section className="flex flex-col gap-[0.4em]">
        <h3 className="text-sm text-gray-400 font-medium">Created / Updated</h3>
        <p className="text-xs text-gray-300">
          Created:{' '}
          <span className="text-white">{formatDate(project.createdAt)}</span>
          <span className="ml-2 text-gray-500">
            {formatRelative(project.createdAt)}
          </span>
        </p>
        <p className="text-xs text-gray-300">
          Updated:{' '}
          <span className="text-white">{formatDate(project.updatedAt)}</span>
          <span className="ml-2 text-gray-500">
            {formatRelative(project.updatedAt)}
          </span>
        </p>
      </section>
    </aside>
  );
}
