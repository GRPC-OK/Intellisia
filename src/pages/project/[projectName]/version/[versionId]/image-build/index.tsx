import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from 'C:\Users\KISIA\Desktop\Git\src\styles\image-build.module.css';

type BuildInfo = {
  name: string
  buildStatus: string
  imageTag: string
}

export default function ImageBuild() {
  const router = useRouter();
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null)

  const { projectName, versionId } = router.query // URL 파라미터 추출


  useEffect(() => {
    if (!projectName || !versionId) return

    const fetchBuildInfo = async () => {
      try {
        const res = await fetch(`/api/image-build/image-build?projectName=${projectName}&versionId=${versionId}`)
        if (!res.ok) throw new Error('Failed to fetch build info')
        const data = await res.json()
        setBuildInfo(data.version)
      } catch (err) {
        console.error('[ImageBuild] fetch error:', err)
      }
    }

    fetchBuildInfo()
  }, [projectName, versionId])

  return (
    <div className={styles.githubBg}>
      <main className={styles.mainContainerFlex} style={{ position: 'relative' }}>
        <div className={styles.mainContentLeft}>
          <h1 className={styles.mainTitle}>Image Build Details</h1>

          {buildInfo ? (
            <div className={styles.buildCard}>
              <div><b>Version Name:</b> {buildInfo.name}</div>
              <div>
                <b>Status:</b>{' '}
                <span className={
                  buildInfo.buildStatus === 'success'
                    ? styles.buildSuccess
                    : styles.buildFail
                }>
                  {buildInfo.buildStatus}
                </span>
              </div>
            </div>
          ) : (
            <p>Loading...</p>
          )}
          <div className={styles.nextBtnContainer}>
            <button className={styles.nextBtn} onClick={() => router.push(`/project/${projectName}/version/${versionId}/image-analysis`)
            }>Next</button>
          </div>
        </div>
      </main>
    </div>
  );
}


