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

  const { projectName, versionId } = router.query // URL 파라미터 추출

  const [loading, setLoading] = useState(false)
  const [triggerResult, setTriggerResult] = useState<string | null>(null)

  const handleTrigger = async () => {
    if (!projectName || !versionId) {
      setTriggerResult('Invalid project or version info')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/image-build/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, versionId }),
      })

      const data = await res.json()
      if (res.ok) {
        setTriggerResult('Workflow triggered successfully!')
      } else {
        setTriggerResult(`Error: ${data.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error(err)
      setTriggerResult('Error triggering workflow')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchBuildStatus = async () => {
      try {
        const res = await fetch('/api/image-build/image-build')
        if (!res.ok) throw new Error('Failed to fetch build status')
        const data = await res.json()
        setBuildInfo(data)
      } catch (err: unknown) {
        console.error('[ImageBuild] fetch error:', err)
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
