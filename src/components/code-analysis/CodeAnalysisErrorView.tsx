interface CodeAnalysisErrorViewProps {
  errorLogUrl: string;
}

export default function CodeAnalysisErrorView({
  errorLogUrl,
}: CodeAnalysisErrorViewProps) {
  return (
    <div className="text-red-400 mt-6">
      <p className="font-bold text-lg mb-2">분석에 실패했습니다.</p>
      <a
        href={errorLogUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-sm"
      >
        에러 로그 보기
      </a>
    </div>
  );
}
