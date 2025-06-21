// src/middleware/auth.middleware.ts - 디버깅 강화 버전
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

// 인증된 사용자 정보를 요청에 추가
declare module 'next' {
    interface NextApiRequest {
        user?: {
            id: number;
            email: string;
            name: string;
            githubId: string;
        };
    }
}

/**
 * JWT 토큰을 검증하고 사용자 정보를 요청에 추가하는 미들웨어
 */
export async function authenticateUser(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => void | Promise<void>
) {
    try {
        console.log(`[Auth Middleware] ${req.method} ${req.url} - Starting authentication`);

        // NextAuth JWT 토큰 가져오기
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            // 디버깅을 위해 다양한 토큰 소스 시도
            secureCookie: process.env.NODE_ENV === 'production',
        });

        console.log('[Auth Middleware] Token:', {
            exists: !!token,
            email: token?.email,
            sub: token?.sub,
            iat: token?.iat,
            exp: token?.exp,
        });

        if (!token || !token.email) {
            console.log('[Auth Middleware] No valid token found');
            return res.status(401).json({
                error: 'Unauthorized',
                message: '로그인이 필요합니다.',
                debug: {
                    tokenExists: !!token,
                    hasEmail: !!token?.email,
                    cookieHeader: req.headers.cookie ? 'present' : 'missing'
                }
            });
        }

        // 데이터베이스에서 사용자 조회
        console.log(`[Auth Middleware] Looking up user with email: ${token.email}`);
        const user = await prisma.user.findUnique({
            where: { email: token.email },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
            }
        });

        if (!user) {
            console.log(`[Auth Middleware] User not found in DB: ${token.email}`);
            return res.status(401).json({
                error: 'User not found',
                message: '사용자를 찾을 수 없습니다. 다시 로그인해주세요.',
                debug: {
                    tokenEmail: token.email,
                    suggestion: 'Try logging out and logging in again'
                }
            });
        }

        // 요청 객체에 사용자 정보 추가
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            githubId: token.sub || '', // GitHub ID
        };

        console.log(`[Auth Middleware] Authentication successful for user ID: ${user.id}`);
        await next();
    } catch (error) {
        console.error('[Auth Middleware Error]', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: '인증 처리 중 오류가 발생했습니다.',
            debug: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
    }
}

/**
 * 사용자 ID를 요청에서 안전하게 가져오는 헬퍼 함수
 */
export function getUserIdFromRequest(req: NextApiRequest): number | null {
    return req.user?.id || null;
}

/**
 * 프로젝트 소유권을 확인하는 미들웨어
 */
export async function checkProjectOwnership(
    req: NextApiRequest,
    res: NextApiResponse,
    projectId: number
): Promise<boolean> {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return false;
    }

    try {
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                OR: [
                    { ownerId: req.user.id },
                    {
                        contributors: {
                            some: {
                                userId: req.user.id
                            }
                        }
                    }
                ]
            }
        });

        if (!project) {
            res.status(403).json({
                error: 'Forbidden',
                message: '이 프로젝트에 대한 권한이 없습니다.'
            });
            return false;
        }

        return true;
    } catch (error) {
        console.error('[Project Ownership Check Error]', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return false;
    }
}