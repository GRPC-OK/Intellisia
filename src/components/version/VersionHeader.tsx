'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface VersionHeaderData {
  project: {
    name: string;
    ownerName: string;
  };
  version: {
    name: string;
  };
}

export default function VersionHeader() {
  const router = useRouter();
  const { versionId } = router.query;

  const [data, setData] = useState<VersionHeaderData | null>(null);

  useEffect(() => {
    if (!router.isReady || typeof versionId !== 'string') return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/versions/${versionId}`);
        if (!res.ok) throw new Error('데이터 불러오기 실패');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('VersionHeader fetch error:', err);
      }
    };

    fetchData();
  }, [router.isReady, versionId]);

  if (!data) return null;

  return (
    <section className="w-full flex flex-col gap-2 mb-6">
      <div className="text-[1.05rem] sm:text-[1.15rem] text-[#b1b5bb] font-medium">
        {data.project.ownerName} /{' '}
        <span className="text-[#58A6FF] font-semibold">
          {data.project.name}
        </span>{' '}
        /{' '}
        <span className="text-[#58A6FF] font-semibold">
          {data.version.name}
        </span>
      </div>
    </section>
  );
}
