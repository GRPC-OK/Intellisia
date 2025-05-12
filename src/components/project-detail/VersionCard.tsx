import Image from 'next/image';

interface VersionCardProps {
  version: {
    id: string;
    name: string;
    description: string;
    isCurrent?: boolean;
  };
  isCurrent?: boolean;
  onClick?: () => void;
}

export default function VersionCard({
  version,
  isCurrent,
  onClick,
}: VersionCardProps) {
  return (
    <div
      className="bg-[#23272F] border border-[#30363D] rounded-[1.2em] flex flex-col gap-[0.6em] min-h-[4em] shadow-none cursor-pointer hover:bg-[#23272F] transition-colors px-[2em] py-[1.6em] mb-[1.1em]"
      onClick={onClick}
      style={{ boxSizing: 'border-box' }}
    >
      <div className="flex items-center gap-[0.8em] mb-[0.1em]">
        <Image
          src="/img/default_project_img.png"
          alt="version icon"
          width={22}
          height={22}
          className="opacity-80"
        />
        <span className="text-[1.18rem] font-bold text-white tracking-tight">
          {version.name}
        </span>
        {(isCurrent || version.isCurrent) && (
          <span className="ml-[0.6em] bg-[#30363D] text-[0.95rem] px-[0.9em] py-[0.18em] rounded-full text-[#58A6FF] font-semibold tracking-tight">
            Current
          </span>
        )}
      </div>
      <div className="text-[1.05rem] text-[#b1b5bb] flex items-start mt-0.5">
        <span className="mr-[0.7em] text-[#58A6FF] text-[1.2rem] leading-none">
          •
        </span>
        <span>{version.description}</span>
      </div>
    </div>
  );
}
