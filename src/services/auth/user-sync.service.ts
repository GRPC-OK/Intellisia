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
                headers: {
                    'Content-Type': 'application/json',
                },
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

    /**
     * 사용자 정보가 동기화되었는지 확인
     */
    static async checkUserSync(): Promise<{
        synced: boolean;
        user?: any;
        error?: string;
    }> {
        try {
            const response = await fetch('/api/auth/session', {
                credentials: 'include',
            });

            if (!response.ok) {
                return {
                    synced: false,
                    error: 'Not authenticated'
                };
            }

            const session = await response.json();

            if (!session?.user) {
                return {
                    synced: false,
                    error: 'No user session found'
                };
            }

            return {
                synced: true,
                user: session.user
            };
        } catch (error) {
            console.error('[Check User Sync Error]', error);
            return {
                synced: false,
                error: 'Failed to check user sync status'
            };
        }
    }
}