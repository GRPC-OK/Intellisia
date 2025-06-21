// src/pages/api/auth/[...nextauth].ts - 완전 타입 안전 버전
import NextAuth, { Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GitHubProvider from 'next-auth/providers/github';
import prisma from '@/lib/prisma';

// 확장된 타입들을 임포트
interface ExtendedSession extends Session {
  accessToken?: string;
  user: {
    id?: string;
    githubId?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface ExtendedJWT extends JWT {
  accessToken?: string;
  githubId?: string;
}

// GitHub Profile 타입
interface GitHubProfile {
  id: string;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string;
  [key: string]: any;
}

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 일주일
  },

  callbacks: {
    async jwt({ token, account, user }): Promise<ExtendedJWT> {
      const extendedToken = token as ExtendedJWT;

      // 처음 로그인 시 GitHub에서 받은 정보를 토큰에 저장
      if (account) {
        extendedToken.accessToken = account.access_token;
        extendedToken.githubId = user?.id;
      }
      return extendedToken;
    },

    async session({ session, token }): Promise<ExtendedSession> {
      const extendedToken = token as ExtendedJWT;

      // 세션에 추가 정보 포함
      const extendedSession: ExtendedSession = {
        ...session,
        accessToken: extendedToken.accessToken,
        user: {
          ...session.user,
          id: extendedToken.sub,
          githubId: extendedToken.githubId,
        }
      };

      return extendedSession;
    },

    /**
     * 로그인 성공 시 자동으로 사용자 정보를 DB에 동기화
     */
    async signIn({ user, account, profile }): Promise<boolean> {
      if (account?.provider === 'github' && profile) {
        try {
          // GitHub 프로필을 GitHubProfile 타입으로 캐스팅
          const githubProfile = profile as GitHubProfile;

          // GitHub 프로필에서 이메일 추출
          let userEmail = githubProfile.email;

          // 이메일이 없는 경우 GitHub API에서 가져오기
          if (!userEmail && account.access_token) {
            try {
              const emailResponse = await fetch('https://api.github.com/user/emails', {
                headers: {
                  'Authorization': `token ${account.access_token}`,
                  'User-Agent': 'Intellisia-App'
                }
              });

              if (emailResponse.ok) {
                const emails = await emailResponse.json();
                const primaryEmail = emails.find((email: any) => email.primary);
                userEmail = primaryEmail?.email;
              }
            } catch (error) {
              console.warn('[GitHub Email Fetch Error]', error);
            }
          }

          // 기본 이메일 설정
          if (!userEmail) {
            userEmail = `${githubProfile.login}@github.local`;
          }

          // 데이터베이스에 사용자 정보 동기화
          await prisma.user.upsert({
            where: { email: userEmail },
            update: {
              name: githubProfile.name || githubProfile.login || 'GitHub User',
              avatarUrl: githubProfile.avatar_url || '/default-avatar.png',
            },
            create: {
              name: githubProfile.name || githubProfile.login || 'GitHub User',
              email: userEmail,
              avatarUrl: githubProfile.avatar_url || '/default-avatar.png',
            },
          });

          console.log(`[Auth Success] User synchronized: ${userEmail}`);
          return true;
        } catch (error) {
          console.error('[SignIn Callback Error]', error);
          // 에러가 발생해도 로그인은 허용 (나중에 수동 동기화 가능)
          return true;
        }
      }
      return true;
    },

    /**
     * 사용자가 접근 권한이 있는지 확인
     */
    async redirect({ url, baseUrl }): Promise<string> {
      // 로그인 후 대시보드로 리디렉션
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },

  pages: {
    signIn: '/', // 커스텀 로그인 페이지
    signOut: '/', // 로그아웃 후 메인 페이지로
    error: '/auth/error', // 에러 페이지
  },

  events: {
    /**
     * 로그인 성공 이벤트 로깅
     */
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`[Auth Event] Sign in: ${user.email}, isNewUser: ${isNewUser}`);
    },

    /**
     * 로그아웃 이벤트 로깅
     */
    async signOut({ session, token }) {
      const sessionAny = session as any;
      console.log(`[Auth Event] Sign out: ${sessionAny?.user?.email || 'Unknown'}`);
    },
  },

  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
});