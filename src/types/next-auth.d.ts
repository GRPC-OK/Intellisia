// types/next-auth.d.ts
import type { DefaultSession } from 'next-auth'

// NextAuth의 타입 정의를 확장하기 위해 'next-auth' 모듈을 다시 선언(declare module)
declare module 'next-auth' {

  // Session 객체를 확장함
  // - 원래 Session에는 accessToken이 없는데 우리가 추가로 넣었기 때문에 타입 보강이 필요함
  interface Session {
    // accessToken: GitHub OAuth 로그인 후 얻은 액세스 토큰
    // - 이 토큰을 통해 GitHub API에 직접 요청 가능
    accessToken?: string
  }
}

// JWT 토큰 구조를 확장하기 위해 'next-auth/jwt' 모듈도 다시 선언
declare module 'next-auth/jwt' {

  // JWT 객체 타입 확장
  // - accessToken은 로그인 직후 GitHub에서 받은 토큰
  // - 이후 session 콜백에서 session에 복사해 사용함
  interface JWT {
    accessToken?: string
  }
}
