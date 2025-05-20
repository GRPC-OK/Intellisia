import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/image-build.module.css';

type VersionInfo = {
  imageTag: string;
  buildStatus: 'success' | 'fail';
};

export default function ImageBuild() {
  const router = useRouter();
  const [data, setData] = useState<VersionInfo | null>(null);

  useEffect(() => {
    fetch('/api/image-build/image-build')
      .then(res => {
        if (!res.ok) throw new Error('유효한 빌드 못찾음');
        return res.json()
      })
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div className={styles.githubBg}>
      <main className={styles.mainContainerFlex} style={{ position: 'relative' }}>
        <div className={styles.mainContentLeft}>
          <h1 className={styles.mainTitle}>Image Build Details</h1>
          
          {data ? (
            <div className={styles.buildCard}>
              <div><b>Image Tag:</b> {data.imageTag}</div>
              <div>
                <b>Status:</b>{' '}
                <span className={
                  data.buildStatus === 'success'
                    ? styles.buildSuccess
                    : styles.buildFail
                }>
                  {data.buildStatus}
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


/*
    <div className={styles.githubBg}>
      <main className={styles.mainContainerFlex} style={{ position: 'relative' }}>
        <div className={styles.mainContentLeft}>
          <h1 className={styles.mainTitle}>Image Build Details</h1>
          <div className={styles.buildCard}>
            <div><b>Image Tag:</b> my-app:1.0.3</div>
            <div><b>Build Time:</b> 2025-05-13 14:23:10</div>
            <div><b>Status:</b> <span className={styles.buildSuccess}>Success</span></div>
            <div className={styles.buildLogTitle}><b>Build Log:</b></div>
          </div>
          <div className={styles.nextBtnContainer}>
            <button className={styles.nextBtn} onClick={() => router.push('/image-analysis')}>Next</button>
          </div>
        </div>
      </main>
    </div>
*/