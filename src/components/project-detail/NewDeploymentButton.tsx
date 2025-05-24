type NewDeploymentButtonProps = {
  onClick: () => void;
  label: string;
};

export default function NewDeploymentButton({
  onClick,
  label,
}: NewDeploymentButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-medium px-3 py-[6px] rounded border border-transparent transition-colors duration-200 whitespace-nowrap"
    >
      {label}
    </button>
  );
}
