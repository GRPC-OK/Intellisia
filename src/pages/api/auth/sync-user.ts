// src/pages/api/auth/sync-user.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

/**
 * GitHub OAuth 로그인 후 사용자 정보를 DB에 동기화하는 API
 * NextAuth 콜백에서 호출되거나 클라이언트에서 직접 호출 가능
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // JWT 토큰에서 사용자 정보 추출
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET
        });

        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: '인증 토큰이 없습니다.'
            });
        }

        // GitHub API를 통해 최신 사용자 정보 가져오기
        let githubUser;
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

            githubUser = await githubResponse.json();
        } catch (error) {
            console.error('[GitHub API Error]', error);
            return res.status(400).json({
                error: 'GitHub API Error',
                message: 'GitHub 사용자 정보를 가져올 수 없습니다.'
            });
        }

        // 이메일이 없는 경우 GitHub API에서 이메일 가져오기
        let userEmail = githubUser.email;
        if (!userEmail) {
            try {
                const emailResponse = await fetch('https://api.github.com/user/emails', {
                    headers: {
                        'Authorization': `token ${token.accessToken}`,
                        'User-Agent': 'Intellisia-App'
                    }
                });

                if (emailResponse.ok) {
                    const emails = await emailResponse.json();
                    const primaryEmail = emails.find((email: any) => email.primary);
                    userEmail = primaryEmail?.email || githubUser.login + '@github.local';
                }
            } catch (error) {
                console.warn('[GitHub Email API Error]', error);
                userEmail = githubUser.login + '@github.local';
            }
        }

        // 데이터베이스에 사용자 정보 동기화 (Upsert)
        const user = await prisma.user.upsert({
            where: {
                email: userEmail
            },
            update: {
                name: githubUser.name || githubUser.login,
                avatarUrl: githubUser.avatar_url || '/default-avatar.png',
                // GitHub 정보 업데이트 (updatedAt 자동 설정)
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
                isNewUser: false, // 실제로는 create/update 여부로 판단
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

// src/services/auth/user-sync.service.ts
/**
 * 사용자 동기화 관련 비즈니스 로직
 */
export class UserSyncService {
    /**
     * 클라이언트에서 사용할 사용자 동기화 함수
     */
    static async syncCurrentUser(): Promise<{
        success: boolean;
        user?: any;
        error?: string;
    }> {
        try {
            const response = await fetch('/api/auth/sync-user', {
                method: 'POST',
                credentials: 'include', // 쿠키 포함
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || 'Failed to sync user'
                };
            }

            return {
                success: true,
                user: data.user
            };
        } catch (error) {
            console.error('[Client User Sync Error]', error);
            return {
                success: false,
                error: 'Network error occurred'
            };
        }
    }
}