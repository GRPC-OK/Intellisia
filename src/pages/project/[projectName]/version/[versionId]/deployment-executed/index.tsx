import { useRouter } from 'next/router';
import Head from 'next/head';
import VersionHeader from '@/components/version/VersionHeader';
import { useEffect, useState } from 'react';

export default function DeploymentExecutedPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      setIsReady(true);
    }
  }, [router.isReady]);

  const handleDeploymentCheck = () => {
    window.open(
      'https://argocd.intellisia.site/applications?showFavorites=false&proj=&sync=&autoSync=&health=&namespace=&cluster=&labels=',
      '_blank'
    );
  };

  if (!isReady) {
    return null;
  }

  return (
    <>
      <Head>
        <title>배포 확인</title>
      </Head>

      <div className="min-h-screen bg-[#0d1117] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <VersionHeader />

          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <button
              onClick={handleDeploymentCheck}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
            >
              배포 확인
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
