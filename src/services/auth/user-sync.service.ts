import { UserSyncResult, UserSyncCheckResult, SessionData } from '@/types/auth';

export class UserSyncService {
    static async syncCurrentUser(): Promise<UserSyncResult> {
        try {
            const response = await fetch('/api/auth/sync-user', {
                method: 'POST',
                credentials: 'include',
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

    static async checkUserSync(): Promise<UserSyncCheckResult> {
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

            const session = await response.json() as SessionData;

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