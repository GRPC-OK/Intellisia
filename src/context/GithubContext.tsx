// 전역 상태를 만들기 위한 Context API 훅들 import
import { createContext, useContext, useState } from 'react'

// Context 객체 생성 (초기값은 null, 타입은 any로 임시 설정)
export const GithubContext = createContext<any>(null)

// Provider 컴포넌트 정의 → 이걸 최상위에 감싸서 상태를 하위에 공유함
export function GithubProvider({ children }: { children: React.ReactNode }) {
  // GitHub 사용자 데이터를 저장할 상태 (초기값 null)
  const [githubData, setGithubData] = useState<any>(null)

  return (
    <GithubContext.Provider value={{ githubData, setGithubData }}>
      {/* 자식 컴포넌트들에게 value를 전달함 */}
      {children}
    </GithubContext.Provider>
  )
}

// Context를 사용하기 위한 커스텀 훅
export const useGithub = () => useContext(GithubContext)
