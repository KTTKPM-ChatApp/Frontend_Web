import { ConversationDto } from "../interface/chat-interface";

const toTimestamp = (value: unknown) => {
    if (value == null) return 0;

    if (typeof value === "number") return value;

    if (typeof value === "string") {
        const asNumber = Number(value);
        if (!Number.isNaN(asNumber)) return asNumber;

        const asDate = new Date(value).getTime();
        return Number.isNaN(asDate) ? 0 : asDate;
    }

    return 0;
};

const getConversationTime = (item: ConversationDto) => {
    return toTimestamp(
        item.lastMessage?.createdAt ??
        (item.lastMessage as any)?.created_at ??
        item.createdAt
    );
};

const getPinnedTime = (item: ConversationDto) => {
    return toTimestamp(item.pinnedAt);
};

export const sortConversations = (items: ConversationDto[]) => {
    const pinnedItems = items
        .filter((item) => Boolean(item.isPinned))
        .sort((a, b) => getPinnedTime(b) - getPinnedTime(a));

    const unpinnedItems = items
        .filter((item) => !item.isPinned)
        .sort((a, b) => getConversationTime(b) - getConversationTime(a));

    return [...pinnedItems, ...unpinnedItems];
};
