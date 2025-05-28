'use client';

interface Props {
  logText: string;
}

export default function CodeAnalysisErrorView({ logText }: Props) {
  return (
    <div className="bg-red-950 text-red-200 mt-6 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm overflow-x-auto">
      <p className="font-bold text-red-300 mb-2">정적 분석에 실패했습니다.</p>
      {logText}
    </div>
  );
}
