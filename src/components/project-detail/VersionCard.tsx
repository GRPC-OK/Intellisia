import { VersionSummary } from '@/types/project';

export interface VersionCardProps extends VersionSummary {
  onClick?: () => void;
}

export default function VersionCard({
  name,
  description,
  isCurrent,
  onClick,
}: VersionCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-[#0D1117] border border-[#30363D] rounded-xl px-6 py-5 mb-4 flex flex-col gap-2 cursor-pointer hover:bg-[#1d1f27] transition"
    >
      <div className="flex items-center gap-3">
        <span className="text-white font-semibold">{name}</span>
        {isCurrent && (
          <span className="ml-3 text-[#58A6FF] bg-[#30363D] text-sm font-medium px-3 py-[0.15rem] rounded-full">
            Current
          </span>
        )}
      </div>
      <p className="text-sm text-[#b1b5bb]">{description}</p>
    </div>
  );
}
