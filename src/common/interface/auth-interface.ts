export type Gender = "male" | "female" | "other";

export interface IUser {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    displayName: string;
    fullName?: string;
    avatarUrl?: string | null;
    bio?: string | null;
    gender?: string;
    dateOfBirth?: Date;
    phone?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRegisterPayload {
    username: string;
    email: string;
    password: string;
    displayName: string;
    gender?: string;
    dateOfBirth?: Date;
}

export interface ILoginPayload {
    email: string;
    password: string;
}

export interface IAuthResponse {
    accessToken: string;
    refreshToken: string;
    tokens?: IRefreshResponse;
    user: IUser;
}

export interface IRefreshPayload {
    refreshToken: string;
}

export interface IRefreshResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
}

export interface IUpdateUserPayload {
    displayName?: string;
    bio?: string;
    avatarUrl?: string | null;
    dateOfBirth?: Date;
    gender?: string;
    email?: string;
}

export interface IApiResponse<T, M = unknown> {
    success?: boolean;
    data?: T;
    meta?: M;
    message?: string;
    timestamp?: string;
}

export interface IRegisterResponse {
    user: IUser;
    message?: string;
}
