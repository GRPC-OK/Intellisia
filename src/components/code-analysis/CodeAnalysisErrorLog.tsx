interface CodeAnalysisErrorLogProps {
  log: string;
}

export default function CodeAnalysisErrorLog({
  log,
}: CodeAnalysisErrorLogProps) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] text-red-400 text-sm whitespace-pre-wrap p-4 rounded-md">
      {log}
    </div>
  );
}
