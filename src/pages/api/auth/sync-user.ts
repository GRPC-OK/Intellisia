import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import {
    UserSyncResponse,
    GitHubUserResponse,
    GitHubEmailResponse
} from '@/types/auth';

interface ExtendedJWT {
    accessToken?: string;
    githubId?: string;
    sub?: string;
    iat?: number;
    exp?: number;
    jti?: string;
}

interface ErrorResponse {
    error: string;
    message: string;
    debug?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<UserSyncResponse | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method Not Allowed',
            message: 'Method Not Allowed'
        });
    }

    try {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET
        }) as ExtendedJWT | null;

        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: '인증 토큰이 없습니다.'
            });
        }

        // GitHub API를 통해 최신 사용자 정보 가져오기
        let githubUser: GitHubUserResponse;
        try {
            const githubResponse = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${token.accessToken}`,
                    'User-Agent': 'Intellisia-App'
                }
            });

            if (!githubResponse.ok) {
                throw new Error(`GitHub API error: ${githubResponse.status}`);
            }

            githubUser = await githubResponse.json() as GitHubUserResponse;
        } catch (error) {
            console.error('[GitHub API Error]', error);
            return res.status(400).json({
                error: 'GitHub API Error',
                message: 'GitHub 사용자 정보를 가져올 수 없습니다.'
            });
        }

        // 이메일이 없는 경우 GitHub API에서 이메일 가져오기
        let userEmail: string = githubUser.email || '';

        if (!userEmail) {
            try {
                const emailResponse = await fetch('https://api.github.com/user/emails', {
                    headers: {
                        'Authorization': `token ${token.accessToken}`,
                        'User-Agent': 'Intellisia-App'
                    }
                });

                if (emailResponse.ok) {
                    const emails = await emailResponse.json() as GitHubEmailResponse[];
                    const primaryEmail = emails.find((email) => email.primary);
                    userEmail = primaryEmail?.email || `${githubUser.login}@github.local`;
                } else {
                    userEmail = `${githubUser.login}@github.local`;
                }
            } catch (error) {
                console.warn('[GitHub Email API Error]', error);
                userEmail = `${githubUser.login}@github.local`;
            }
        }

        // userEmail이 여전히 빈 문자열인 경우 대체값 설정
        if (!userEmail) {
            userEmail = `${githubUser.login}@github.local`;
        }

        // 데이터베이스에 사용자 정보 동기화 (Upsert)
        const user = await prisma.user.upsert({
            where: {
                email: userEmail
            },
            update: {
                name: githubUser.name || githubUser.login,
                avatarUrl: githubUser.avatar_url || '/default-avatar.png',
            },
            create: {
                name: githubUser.name || githubUser.login,
                email: userEmail,
                avatarUrl: githubUser.avatar_url || '/default-avatar.png',
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                createdAt: true,
            }
        });

        return res.status(200).json({
            message: '사용자 정보가 성공적으로 동기화되었습니다.',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                isNewUser: false,
            }
        });

    } catch (error) {
        console.error('[User Sync Error]', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: '사용자 동기화 중 오류가 발생했습니다.'
        });
    }
}