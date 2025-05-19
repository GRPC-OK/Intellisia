// NextAuth의 기본 설정 함수 및 타입 import
import NextAuth from 'next-auth'

// GitHub OAuth Provider import (NextAuth에서 공식 지원하는 소셜 로그인 제공자 중 하나)
import GitHubProvider from 'next-auth/providers/github'

// NextAuth 설정을 기본 export
export default NextAuth({

  //  1. 인증 제공자 설정
  providers: [
    GitHubProvider({
      // GitHub OAuth 앱에서 발급받은 Client ID와 Secret을 환경변수에서 불러옴
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],

  // ✅ JWT 기반 세션 전략 설정
  session: {
    strategy: 'jwt',
    maxAge: 60 * 30, // 세션 유지 기간: 30분 (초 단위)
  },

  callbacks: {
    async jwt({ token, account }) {
      // 처음 로그인 시 account에 GitHub에서 받은 정보가 들어있음
      if (account) {
        // GitHub에서 받은 access_token을 JWT 토큰에 저장
        token.accessToken = account.access_token
      }
      // JWT 토큰 반환 (클라이언트에 저장되거나 이후 session 콜백에서 사용됨)
      return token
    },

    //  클라이언트가 useSession() 호출 시: session 객체 생성 단계
    async session({ session, token }) {
      // jwt 콜백에서 token에 저장한 accessToken을 session 객체에도 복사
      session.accessToken = token.accessToken
      // 최종 session 객체 반환 → useSession()에서 이걸 받아서 사용함
      return session
    },
  },

  //  필수: NextAuth의 내부 암호화용 시크릿 키 (세션/쿠키 암호화에 사용)
  secret: process.env.NEXTAUTH_SECRET,
})
