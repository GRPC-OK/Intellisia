import Image from 'next/image';
import { Contributor } from '@/types/project';

interface ContributorsAvatarsProps {
  contributors: Contributor[];
  size?: number;
}
export default function ContributorsAvatars({
  contributors,
  size = 32,
}: ContributorsAvatarsProps) {
  return (
    <div className="flex items-center gap-[0.6em]">
      {contributors.map((c) => (
        <div
          key={c.id}
          className="rounded-full border-[0.15em] border-[#181A20] bg-[#23272F] overflow-hidden z-[1] flex items-center justify-center"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            marginLeft: 0,
          }}
        >
          <Image
            src={c.avatarUrl || '/img/default_project_img.png'}
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
