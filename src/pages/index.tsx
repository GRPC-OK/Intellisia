// NextAuth에서 제공하는 클라이언트 훅과 함수 불러오기
// - useSession: 현재 로그인 세션 조회
// - signIn: 로그인 시작 (GitHub OAuth 요청)
// - signOut: 세션 종료 및 로그아웃 처리
import { signIn, signOut, useSession } from 'next-auth/react'
import { useGithub } from '../context/GithubContext'
// React 상태 관리를 위한 useState 훅 import
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

// index.tsx 전용 CSS 모듈 import
// - CSS 클래스명을 styles.클래스명으로 사용 가능 (모듈 스코프)
import styles from '../styles/index.module.css'
import Image from 'next/image'

// 메인 컴포넌트 정의
export default function Home() {
  // useSession 훅을 통해 세션 정보 가져오기
  // - data: 사용자 세션 객체 (null일 수 있음)
  const { data: session } = useSession()
  const { githubData, setGithubData } = useGithub()

  // 로그인 중 상태를 표시할 로컬 상태 변수
  // - true면 로딩 중 UI 표시
  const [loading, setLoading] = useState(false)

  const router = useRouter()

   // ✅ 세션 생기면 /dashboard로 이동
  useEffect(() => {
    if (session && githubData) {
      router.push('/dashboard')
    }
  }, [session, githubData, router])

  // GitHub 로그인 처리 함수
  const handleLogin = async () => {
    setLoading(true)                // 로딩 중임을 표시 → 스피너 출력
    await signIn('github')         // GitHub OAuth 로그인 요청 (리디렉션 발생)
    // 리디렉션 때문에 이 아래는 실행되지 않음
  }

  useEffect(() => {
    if (!session?.accessToken || githubData) return

    const headers = {
      Authorization: `token ${session.accessToken}`,
    }

    const fetchGitHubData = async () => {
      try {
        const res = await fetch('https://api.github.com/user', { headers })
        const data = await res.json()
        setGithubData(data)
      } catch (err) {
        console.error('GitHub API 실패:', err)
      }
    }

    fetchGitHubData()
  }, [session, githubData])

  // JSX 반환
  return (
    <div className={styles.page}>
      <main className={styles.main}>

        {/* 1. 로그인 중일 때: 로딩 텍스트 + 스피너 */}
        {loading ? (
          <div className={styles.loading__spinner}>
            <p>로그인 중...</p>
            <div className={styles.spinner}></div>
          </div>
          // 2. 로그인하지 않은 경우: 로그인 버튼 출력
        ) : !session ? (
          <>
            {/* 버튼 클릭 시 handleLogin 함수 실행 */}
            <Image
              src="/githubMark-white.png"  // public 폴더 기준 경로
              alt="GitHub 로고"
              width={100}  // 필수 속성
              height={100} // 필수 속성
            />
            <h1>Welcome to Intellisia</h1>
            <p className={styles.text}>Are you a member of Intellisia?</p>
            <button className={styles.loginButton} onClick={handleLogin}>Login with GitHub</button>
          </>
        ) : null}
      </main>
      
    </div>
  )
}



// 혹시 몰라서 따로 빼놓음 헤헤헤

// 프로필 이미지 출력
// <img
//   src={session.user?.image ?? ''} // 이미지가 없으면 빈 문자열 처리
//   alt="프로필 이미지"
//   style={{
//     width: '100px',
//     borderRadius: '50px',          // 원형 스타일
//     margin: '1rem'
//   }}
// />

//     <div className={styles.loginBox}>
//       {/* GitHub에서 받은 사용자 이름 출력 */}
//       <p className={styles.text__userName}>{session.user?.name} 님 환영합니다!</p>

//       {/* 로그아웃 버튼 → 클릭 시 signOut() 실행 */}
//       <button className={styles.loginButton} onClick={() => signOut()}>Logout</button>
      
//       {/* 로그아웃 버튼 → 클릭 시 signOut() 실행 */}
//       <button className={styles.loginButton} onClick={() => signOut()}>Go to Dashboard</button>
//     </div>