import { Gender } from "./auth-interface";

export interface IEditProfileForm {
    fullName: string;
    bio: string;
    gender: Gender | string;
    dateOfBirth: string;
    phone: string; // chỉ xem
}export interface IUpdateMyProfilePayload {
    fullName?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    dateOfBirth?: string | null;
    gender?: Gender | string;
    email?: string;

}