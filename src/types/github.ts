// src/types/github.ts
export type GitHubUser = {
  login: string
  name: string
  email: string
  avatar_url: string
  html_url: string
}

export type GithubContextType = {
  githubData: GitHubUser | null
  setGithubData: (data: GitHubUser | null) => void
}
