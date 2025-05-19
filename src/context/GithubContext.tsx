import { createContext, useContext, useState } from 'react'
import { GitHubUser, GithubContextType } from '../types/github'

// Context 객체 생성 (초기값 null)
export const GithubContext = createContext<GithubContextType | null>(null)

export function GithubProvider({ children }: { children: React.ReactNode }) {
  const [githubData, setGithubData] = useState<GitHubUser | null>(null)

  return (
  <GithubContext.Provider value={{ githubData, setGithubData }}>
      {children}
    </GithubContext.Provider>
  )
}

export const useGithub = () => {
  const context = useContext(GithubContext)
  if (!context) throw new Error('useGithub must be used within a GithubProvider')
  return context
}

