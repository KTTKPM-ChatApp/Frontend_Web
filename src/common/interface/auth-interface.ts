export type Gender = "male" | "female" | "other";

export interface IBase {
    email?: string;
    fullName: string;
    gender: Gender | string;
    dateOfBirth: string | null;
}

export interface IUser extends IBase {
    id: string;
    phone: string;
    avatarUrl: string | null;
    bio: string | null;
    status: "active" | "inactive" | "blocked";
    createdAt: string;
    avatarResolvedUrl: string
}



export interface IRefreshPayload {
    refreshToken: string;
}

export interface IRefreshResponse {
    accessToken: string;
    expiresIn: number;
}
export interface ITokens {
    accessToken: string | "";
    refreshToken: string | "";
    expiresIn: number | null;
}

export interface IRegisterPayload extends IBase {
    firebaseIdToken: string;
    password: string;
}

export interface ILoginPayload {
    phone: string;
    password: string;
}

export interface IAuthData {
    user: IUser;
    tokens: ITokens;
}

export interface IApiResponse<T, M = unknown> {
    success: boolean;
    data: T;
    meta?: M;
    message?: string;
    timestamp?: string;
}
