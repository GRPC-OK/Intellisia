import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/image-build.module.css';

type BuildInfo = {
  name: string
  buildStatus: 'success' | 'fail'
  imageTag: string
}

export default function ImageBuild() {
  const router = useRouter();
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBuildStatus = async () => {
      try {
        const res = await fetch('/api/image-build/image-build')
        if (!res.ok) throw new Error('Failed to fetch build status')
        const data = await res.json()
        setBuildInfo(data)
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      }
    }

    fetchBuildStatus()
  }, [])

  return (
    <div className={styles.githubBg}>
      <main className={styles.mainContainerFlex} style={{ position: 'relative' }}>
        <div className={styles.mainContentLeft}>
          <h1 className={styles.mainTitle}>Image Build Details</h1>

          {buildInfo ? (
            <div className={styles.buildCard}>
              <div><b>Version Name:</b> {buildInfo.name}</div>
              <div><b>Image Tag:</b> {buildInfo.imageTag}</div>
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
            <button className={styles.nextBtn} onClick={() => router.push('/image-analysis')}>Next</button>
          </div>
        </div>
      </main>
    </div>
  );
}
