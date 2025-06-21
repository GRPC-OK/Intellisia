export interface UserSyncResponse {
    message: string;
    user: {
        id: number;
        name: string;
        email: string;
        avatarUrl: string;
        isNewUser: boolean;
    };
}

export interface UserSyncResult {
    success: boolean;
    user?: UserSyncResponse['user'];
    error?: string;
}

export interface UserSyncCheckResult {
    synced: boolean;
    user?: {
        id?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    error?: string;
}

export interface SessionUser {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

export interface SessionData {
    user?: SessionUser;
    expires?: string;
}

export interface GitHubUserResponse {
    id: string;
    login: string;
    name?: string | null;
    email?: string | null;
    avatar_url?: string;
    [key: string]: unknown;
}

export interface GitHubEmailResponse {
    email: string;
    primary: boolean;
    verified: boolean;
}