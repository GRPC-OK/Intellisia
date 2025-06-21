// src/types/next-auth.d.ts - 완전한 타입 정의
import type { DefaultSession, DefaultUser } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

// NextAuth의 타입 정의를 확장하기 위해 'next-auth' 모듈을 다시 선언
declare module 'next-auth' {
  // Session 객체를 확장함
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      githubId?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    expires: string;
  }

  interface User extends DefaultUser {
    githubId?: string;
  }
}

// JWT 토큰 구조를 확장하기 위해 'next-auth/jwt' 모듈도 다시 선언
declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    githubId?: string;
  }
}

// GitHub Profile 타입 정의
export interface GitHubProfile {
  id: string;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string;
  html_url?: string;
  type?: string;
  company?: string | null;
  location?: string | null;
  bio?: string | null;
  public_repos?: number;
  followers?: number;
  following?: number;
  created_at?: string;
  updated_at?: string;
}