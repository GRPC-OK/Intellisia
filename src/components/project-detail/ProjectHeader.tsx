interface ProjectTitleBarProps {
  projectName: string;
  creatorName: string;
}

export default function ProjectHeader({
  projectName,
  creatorName,
}: ProjectTitleBarProps) {
  return (
    <section className="w-full flex flex-col gap-2 mb-6">
      <div className="text-[1.05rem] sm:text-[1.15rem] text-[#b1b5bb] font-medium">
        {creatorName} /{' '}
        <span className="text-[#58A6FF] font-semibold">{projectName}</span>
      </div>
    </section>
  );
}
