export type FriendRequestAction = "accept" | "reject";

export interface IFriendUser {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    phone?: string;
    bio?: string | null;
}

export interface IFriendRequest {
    id: string;
    senderId: string;
    receiverId: string;
    message: string | null;
    status: "pending" | "accepted" | "rejected" | "cancelled";
    createdAt: string;
    sender?: IFriendUser;
    receiver?: IFriendUser;
    user?: IFriendUser;
}

export interface ISendFriendRequestPayload {
    userId: string;
    message?: string;
}

export interface IRespondFriendRequestPayload {
    action: FriendRequestAction;
}