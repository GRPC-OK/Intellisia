'use client';

import dynamic from 'next/dynamic';

const Viewer = dynamic(
  () => import('@microsoft/sarif-web-component').then((mod) => mod.Viewer),
  { ssr: false }
);

interface CodeAnalysisViewerProps {
  sarif: object;
}

export default function CodeAnalysisViewer({ sarif }: CodeAnalysisViewerProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-black">
      <Viewer logs={[sarif]} />
    </div>
  );
}
