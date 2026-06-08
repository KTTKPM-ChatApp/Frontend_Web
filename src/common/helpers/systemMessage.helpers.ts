import {
    ConversationUpdatedMetadata,
    GroupDisbandedMetadata,
    MemberAddedMetadata,
    MemberLeftMetadata,
    MemberRemovedMetadata,
    OwnerTransferredMetadata,
    RoleChangedMetadata,
    SystemEventType,
    UiMessage,
} from "@/src/common/interface/chat-interface";

export const buildSystemMessageText = (message: UiMessage) => {
    // console.log("SystemEventType enum:", SystemEventType);
    // console.log("message.system_event_type:", message.system_event_type);
    switch (message.system_event_type) {
        case SystemEventType.MEMBER_ADDED: {
            const data = message.metadata as MemberAddedMetadata;
            const actor = data?.added_by_name || "Ai đó";
            const names =
                data?.added_members?.map((m) => m.full_name).filter(Boolean).join(", ") ||
                "thành viên";

            return `${actor} đã thêm ${names} vào nhóm`;
        }

        case SystemEventType.MEMBER_REMOVED: {
            const data = message.metadata as MemberRemovedMetadata;
            const actor = data?.removed_by_name || "Ai đó";
            const removedUser = data?.removed_user_name || "một thành viên";

            return `${actor} đã xóa ${removedUser} khỏi nhóm`;
        }

        case SystemEventType.MEMBER_LEFT: {
            const data = message.metadata as MemberLeftMetadata;
            const name = data?.user_name || "Ai đó";

            return `${name} đã rời khỏi nhóm`;
        }

        case SystemEventType.OWNER_TRANSFERRED: {
            const data = message.metadata as OwnerTransferredMetadata;
            const oldOwner = data?.previous_owner_name || "Trưởng nhóm cũ";
            const newOwner = data?.new_owner_name || "Trưởng nhóm mới";

            return `${oldOwner} đã chuyển quyền trưởng nhóm cho ${newOwner}`;
        }

        case SystemEventType.ROLE_CHANGED: {
            const data = message.metadata as RoleChangedMetadata;
            const actor = data?.updated_by_name || "Ai đó";
            const target = data?.target_user_name || "một thành viên";

            if (data?.new_role === "co_owner") {
                return `${actor} đã đặt ${target} làm phó nhóm`;
            }

            if (data?.new_role === "member") {
                return `${actor} đã thu hồi quyền phó nhóm của ${target}`;
            }

            return `${actor} đã cập nhật quyền của ${target}`;
        }

        case SystemEventType.GROUP_DISBANDED: {
            const data = message.metadata as GroupDisbandedMetadata;
            const actor = data?.disbanded_by_name || "Ai đó";

            return `${actor} đã giải tán nhóm`;
        }

        case SystemEventType.CONVERSATION_UPDATED: {
            const data = message.metadata as ConversationUpdatedMetadata;
            const actor = data?.updated_by_name || "Ai đó";

            if (data?.field === "name") {
                return `${actor} đã đổi tên nhóm thành "${data.new_value}"`;
            }

            if (data?.field === "avatar") {
                return `${actor} đã thay đổi ảnh đại diện nhóm`;
            }

            return `${actor} đã cập nhật thông tin nhóm`;
        }

        case SystemEventType.CALL_LOG: {
            const metadata = message.metadata as Record<string, unknown>;
            const callType = metadata?.callType === "VIDEO" ? "video" : "thoại";
            const duration = (metadata?.duration as number) ?? 0;
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;
            const endedAt = metadata?.endedAt
                ? new Date(metadata.endedAt as string)
                : new Date();
            const timeStr = endedAt.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            });

            return `Cuộc gọi ${callType} kết thúc lúc ${timeStr} (${minutes} ph ${seconds} giây)`;
        }

        default:
            return message.body || "Tin nhắn hệ thống";
    }
};