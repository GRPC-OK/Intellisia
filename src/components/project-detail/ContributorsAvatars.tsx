import Image from 'next/image';

interface ContributorsAvatarsProps {
  contributors: { id: string; name: string; avatar?: string }[];
  size?: number;
}

export default function ContributorsAvatars({
  contributors,
  size = 32,
}: ContributorsAvatarsProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em' }}>
      {contributors.map((c) => (
        <div
          key={c.id}
          style={{
            width: size,
            height: size,
            borderRadius: '9999px',
            border: '0.15em solid #181A20',
            background: '#23272F',
            overflow: 'hidden',
            marginLeft: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            src={c.avatar || '/img/default_project_img.png'}
            alt={c.name}
            width={size}
            height={size}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
      ))}
    </div>
  );
}
