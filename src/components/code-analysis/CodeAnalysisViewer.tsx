interface CodeAnalysisViewerProps {
  sarifUrl: string;
}

export default function CodeAnalysisViewer({ sarifUrl }: { sarifUrl: string }) {
  return (
    <div className="mt-6">
      <sarif-viewer src={sarifUrl} />
    </div>
  );
}
