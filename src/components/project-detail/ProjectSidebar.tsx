import Link from 'next/link';
import ContributorsAvatars from './ContributorsAvatars';

interface ProjectSidebarProps {
  project: {
    name?: string;
    description: string;
    githubUrl: string;
    contributors: { id: string; name: string; avatar?: string }[];
    domain: string;
    createdAt: string;
    updatedAt: string;
  };
}

function getRelativeTime() {
  // Placeholder: 실제 서비스에서는 dayjs, date-fns 등 사용
  return '';
}

export default function ProjectSidebar({ project }: ProjectSidebarProps) {
  return (
    <aside
      style={{
        width: '22rem',
        background: '#23272F',
        borderRadius: '1.1em',
        padding: '1.1em 1.1em 1.1em 1.1em',
        border: '1px solid #30363D',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6em',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* 프로젝트명 */}
      {project.name && (
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '0.2em',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}
        >
          {project.name}
        </div>
      )}
      <div>
        <div
          style={{
            fontSize: '1.01rem',
            color: '#b1b5bb',
            marginBottom: '0.15em',
            fontWeight: 500,
          }}
        >
          project
        </div>
        <div
          style={{
            fontSize: '1.08rem',
            color: '#e5e7eb',
            marginBottom: '0.5em',
            lineHeight: 1.4,
          }}
        >
          {project.description}
        </div>
      </div>
      <div
        style={{ borderTop: '1px solid #353945', margin: '0.25em 0 0.25em 0' }}
      />
      <div>
        <div
          style={{
            fontSize: '1.01rem',
            color: '#b1b5bb',
            marginBottom: '0.15em',
            fontWeight: 500,
          }}
        >
          Github link
        </div>
        <Link
          href={project.githubUrl}
          target="_blank"
          style={{
            color: '#58A6FF',
            textDecoration: 'underline',
            wordBreak: 'break-all',
            fontSize: '1.08rem',
            marginBottom: '0.5em',
            display: 'block',
          }}
        >
          {project.githubUrl}
        </Link>
      </div>
      <div
        style={{ borderTop: '1px solid #353945', margin: '0.25em 0 0.25em 0' }}
      />
      <div>
        <div
          style={{
            fontSize: '1.01rem',
            color: '#b1b5bb',
            marginBottom: '0.1em',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em',
          }}
        >
          {project.contributors.length} participants
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.7em',
            alignItems: 'center',
            marginBottom: '0.2em',
            flexWrap: 'wrap',
          }}
        >
          <ContributorsAvatars contributors={project.contributors} size={38} />
        </div>
      </div>
      <div
        style={{ borderTop: '1px solid #353945', margin: '0.25em 0 0.25em 0' }}
      />
      <div>
        <div
          style={{
            fontSize: '1.01rem',
            color: '#b1b5bb',
            marginBottom: '0.15em',
            fontWeight: 500,
          }}
        >
          Domain
        </div>
        <input
          style={{
            width: '100%',
            background: '#181A20',
            color: '#d1d5db',
            borderRadius: '0.7em',
            padding: '0.5em 0.8em',
            border: 'none',
            fontSize: '1.08rem',
            fontWeight: 500,
            marginBottom: '0.3em',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
          value={project.domain}
          readOnly
        />
      </div>
      <div
        style={{ borderTop: '1px solid #353945', margin: '0.25em 0 0.25em 0' }}
      />
      <div
        style={{
          fontSize: '1.01rem',
          color: '#b1b5bb',
          marginBottom: '0.15em',
          fontWeight: 500,
        }}
      >
        Created / Updated
      </div>
      <div
        style={{
          fontSize: '0.93rem',
          color: '#b1b5bb',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.12em',
          fontWeight: 400,
        }}
      >
        <span>
          Created: <span style={{ color: '#e5e7eb' }}>{project.createdAt}</span>{' '}
          <span style={{ color: '#6b7280', marginLeft: '0.5em' }}>
            {getRelativeTime() || '2 days ago'}
          </span>
        </span>
        <span>
          Updated: <span style={{ color: '#e5e7eb' }}>{project.updatedAt}</span>{' '}
          <span style={{ color: '#6b7280', marginLeft: '0.5em' }}>
            {getRelativeTime() || '4 hours ago'}
          </span>
        </span>
      </div>
    </aside>
  );
}
