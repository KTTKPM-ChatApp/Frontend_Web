import { Gender } from "./auth-interface";

export interface IEditProfileForm {
    displayName: string;
    bio: string;
    gender: Gender | string;
    dateOfBirth: string;
    phone: string;
    username?: string;
    email?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}export interface IUpdateMyProfilePayload {
    displayName?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    dateOfBirth?: string | null;
    gender?: Gender | string;
    email?: string;

}