import { create } from "zustand";
import { IFriendRequest, IFriendUser } from "../interface/friend-interface";
import { friendService } from "../service/friend-service";
import { chatService } from "../service/chat-service";
import { useChatStore } from "./useChatStore";

interface FriendState {
    friends: IFriendUser[];
    pendingRequests: IFriendRequest[];
    sentRequests: IFriendRequest[];

    loadingFriends: boolean;
    loadingPending: boolean;
    loadingSent: boolean;
    sendingRequest: boolean;

    error: string | null;

    fetchFriends: () => Promise<void>;
    fetchPendingRequests: () => Promise<void>;
    fetchSentRequests: () => Promise<void>;

    sendFriendRequest: (userId: string, message?: string) => Promise<boolean>;
    acceptFriendRequest: (requestId: string) => Promise<boolean>;
    rejectFriendRequest: (requestId: string) => Promise<boolean>;
    cancelFriendRequest: (requestId: string) => Promise<boolean>;
    removeFriend: (friendId: string) => Promise<boolean>;

    getRelationStatus: (
        userId: string
    ) => "self" | "friend" | "incoming" | "outgoing" | "none";
    getIncomingRequestByUserId: (userId: string) => IFriendRequest | undefined;
    getOutgoingRequestByUserId: (userId: string) => IFriendRequest | undefined;
}

const normalizeFriendUser = (raw: any): IFriendUser | undefined => {
    if (!raw) return undefined;

    return {
        id: raw.id ?? "",
        fullName: raw.fullName ?? raw.full_name ?? raw.displayName ?? "Người dùng",
        avatarUrl: raw.avatarUrl ?? raw.avatar_url ?? null,
        phone: raw.phone ?? null,
    };
};

const normalizeFriendRequest = (raw: any): IFriendRequest => {
    const sender = normalizeFriendUser(raw.sender);

    const receiver =
        normalizeFriendUser(raw.receiver) || normalizeFriendUser(raw.user);

    return {
        id: raw.id ?? "",
        senderId: raw.senderId ?? raw.sender_id ?? sender?.id ?? "",
        receiverId: raw.receiverId ?? raw.receiver_id ?? receiver?.id ?? "",
        message: raw.message ?? null,
        status: raw.status ?? "pending",
        createdAt: raw.createdAt ?? raw.created_at ?? "",
        sender,
        receiver,
        user: normalizeFriendUser(raw.user),
    };
};

export const useFriendStore = create<FriendState>((set, get) => ({
    friends: [],
    pendingRequests: [],
    sentRequests: [],

    loadingFriends: false,
    loadingPending: false,
    loadingSent: false,
    sendingRequest: false,

    error: null,

    fetchFriends: async () => {
        try {
            set({ loadingFriends: true, error: null });
            const res = await friendService.getFriends();

            const items = Array.isArray(res?.payload?.data) ? res.payload.data : [];
            const normalizedFriends = items
                .map(normalizeFriendUser)
                .filter(Boolean) as IFriendUser[];

            set({ friends: normalizedFriends });
        } catch (error: any) {
            set({ error: error?.message || "Không tải được danh sách bạn bè" });
        } finally {
            set({ loadingFriends: false });
        }
    },

    fetchPendingRequests: async () => {
        try {
            set({ loadingPending: true, error: null });
            const res = await friendService.getPendingRequests();

            const items = Array.isArray(res?.payload?.data) ? res.payload.data : [];
            const normalizedRequests = items.map(normalizeFriendRequest);

            set({ pendingRequests: normalizedRequests });
        } catch (error: any) {
            set({ error: error?.message || "Không tải được lời mời đã nhận" });
        } finally {
            set({ loadingPending: false });
        }
    },

    fetchSentRequests: async () => {
        try {
            set({ loadingSent: true, error: null });
            const res = await friendService.getSentRequests();

            const items = Array.isArray(res?.payload?.data) ? res.payload.data : [];
            const normalizedRequests = items.map(normalizeFriendRequest);

            set({ sentRequests: normalizedRequests });
        } catch (error: any) {
            set({ error: error?.message || "Không tải được lời mời đã gửi" });
        } finally {
            set({ loadingSent: false });
        }
    },

    sendFriendRequest: async (userId, message) => {
        try {
            set({ sendingRequest: true, error: null });

            await friendService.sendRequest({
                userId,
                message: message?.trim() || "Hi, I would like to add you as a friend!",
            });

            await get().fetchSentRequests();
            return true;
        } catch (error: any) {
            set({
                error:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Gửi lời mời kết bạn thất bại",
            });
            return false;
        } finally {
            set({ sendingRequest: false });
        }
    },

    acceptFriendRequest: async (requestId) => {
        try {
            set({ error: null });

            await friendService.respondRequest(requestId, { action: "accept" });

            await Promise.all([
                get().fetchPendingRequests(),
                get().fetchFriends(),
                useChatStore.getState().fetchListConversation(),
            ]);

            return true;
        } catch (error: any) {
            set({
                error:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Chấp nhận lời mời thất bại",
            });
            return false;
        }
    },

    rejectFriendRequest: async (requestId) => {
        try {
            set({ error: null });
            await friendService.respondRequest(requestId, { action: "reject" });
            await get().fetchPendingRequests();
            return true;
        } catch (error: any) {
            set({
                error:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Từ chối lời mời thất bại",
            });
            return false;
        }
    },

    cancelFriendRequest: async (requestId) => {
        try {
            set({ error: null });
            await friendService.cancelRequest(requestId);
            await get().fetchSentRequests();
            return true;
        } catch (error: any) {
            set({
                error:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Hủy lời mời thất bại",
            });
            return false;
        }
    },

    removeFriend: async (friendId) => {
        try {
            set({ error: null });
            await friendService.removeFriend(friendId);
            await get().fetchFriends();
            return true;
        } catch (error: any) {
            set({
                error:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Hủy kết bạn thất bại",
            });
            return false;
        }
    },

    getRelationStatus: (userId) => {
        const { friends, pendingRequests, sentRequests } = get();

        if (friends.some((item) => item.id === userId)) return "friend";

        if (
            pendingRequests.some(
                (item) =>
                    item.sender?.id === userId ||
                    item.senderId === userId ||
                    item.user?.id === userId
            )
        ) {
            return "incoming";
        }

        if (
            sentRequests.some(
                (item) =>
                    item.receiver?.id === userId ||
                    item.receiverId === userId ||
                    item.user?.id === userId
            )
        ) {
            return "outgoing";
        }

        return "none";
    },

    getIncomingRequestByUserId: (userId) => {
        return get().pendingRequests.find(
            (item) =>
                item.sender?.id === userId ||
                item.senderId === userId ||
                item.user?.id === userId
        );
    },

    getOutgoingRequestByUserId: (userId) => {
        return get().sentRequests.find(
            (item) =>
                item.receiver?.id === userId ||
                item.receiverId === userId ||
                item.user?.id === userId
        );
    },
}));