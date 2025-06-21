import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from '../styles/index.module.css';
import { UserSyncService } from '../services/auth/user-sync.service';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // useCallback으로 감싸서 의존성 배열 문제 해결
  const handleUserSync = useCallback(async () => {
    setSyncStatus('syncing');

    try {
      const result = await UserSyncService.syncCurrentUser();

      if (result.success) {
        setSyncStatus('success');
        console.log('[User Sync Success]', result.user);

        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setSyncStatus('error');
        console.error('[User Sync Error]', result.error);

        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('[User Sync Exception]', error);
      setSyncStatus('error');

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  }, [router]);

  // 이미 로그인된 경우 대시보드로 리디렉션
  useEffect(() => {
    if (status === 'authenticated' && session) {
      handleUserSync();
    }
  }, [session, status, handleUserSync]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signIn('github', {
        callbackUrl: '/dashboard',
        redirect: false
      });
    } catch (error) {
      console.error('[Login Error]', error);
      setLoading(false);
    }
  };

  // 로딩 상태
  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.loading__spinner}>
            <p>인증 상태를 확인하는 중...</p>
            <div className={styles.spinner}></div>
          </div>
        </main>
      </div>
    );
  }

  // 로그인 중 상태
  if (loading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.loading__spinner}>
            <p>GitHub으로 로그인 중...</p>
            <div className={styles.spinner}></div>
          </div>
        </main>
      </div>
    );
  }

  // 사용자 동기화 중 상태
  if (syncStatus === 'syncing') {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.loading__spinner}>
            <p>사용자 정보를 동기화하는 중...</p>
            <div className={styles.spinner}></div>
          </div>
        </main>
      </div>
    );
  }

  // 동기화 성공 상태
  if (syncStatus === 'success') {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className="text-center">
            <div className="text-green-500 text-2xl mb-4">✅</div>
            <p className="text-lg">로그인 성공!</p>
            <p className="text-sm text-gray-400">대시보드로 이동합니다...</p>
          </div>
        </main>
      </div>
    );
  }

  // 동기화 에러 상태
  if (syncStatus === 'error') {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className="text-center">
            <div className="text-yellow-500 text-2xl mb-4">⚠️</div>
            <p className="text-lg">로그인은 성공했지만</p>
            <p className="text-sm text-gray-400">사용자 정보 동기화에 문제가 있었습니다.</p>
            <p className="text-sm text-gray-400">대시보드로 이동합니다...</p>
          </div>
        </main>
      </div>
    );
  }

  // 로그인되지 않은 상태 - 로그인 폼 표시
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          src="/next.svg"
          alt="Intellisia 로고"
          width={100}
          height={100}
          className="mb-8"
        />

        <h1 className="text-4xl font-bold mb-4 text-center">
          Welcome to Intellisia
        </h1>

        <p className={styles.text}>
          DevOps 자동화 플랫폼에 오신 것을 환영합니다
        </p>

        <div className="text-center space-y-4">
          <p className="text-sm text-gray-400">
            GitHub 계정으로 로그인하여 시작하세요
          </p>

          <button
            className={styles.loginButton}
            onClick={handleLogin}
            disabled={loading}
          >
            <span className="flex items-center justify-center space-x-2">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>Login with GitHub</span>
            </span>
          </button>

          <div className="text-xs text-gray-500 mt-4 max-w-md">
            <p>
              로그인하면 <a href="#" className="text-blue-400 hover:underline">서비스 이용약관</a> 및{' '}
              <a href="#" className="text-blue-400 hover:underline">개인정보 처리방침</a>에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}