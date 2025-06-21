import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import prisma from '@/lib/prisma';

// GitHub Profile 타입 정의
interface GitHubProfileType {
  id: string;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string;
  html_url?: string;
  [key: string]: unknown;
}

// Session 타입 정의
interface SessionType {
  user?: {
    email?: string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
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
    maxAge: 60 * 60 * 24 * 7,
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.githubId = token.sub;
      }
      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        user: {
          ...session.user,
          id: token.sub,
          githubId: token.githubId,
        }
      };
    },

    async signIn({ profile }) {
      if (profile) {
        try {
          const githubProfile = profile as GitHubProfileType;

          let userEmail: string = githubProfile.email || '';

          if (!userEmail) {
            userEmail = `${githubProfile.login}@github.local`;
          }

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
          return true;
        }
      }
      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },

  events: {
    async signIn({ user, isNewUser }) {
      console.log(`[Auth Event] Sign in: ${user.email}, isNewUser: ${isNewUser}`);
    },

    async signOut({ session }) {
      const sessionTyped = session as unknown as SessionType;
      console.log(`[Auth Event] Sign out: ${sessionTyped?.user?.email || 'Unknown'}`);
    },
  },

  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
});