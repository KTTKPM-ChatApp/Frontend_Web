"use client";

import { useEffect, useState, useCallback } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { toast } from "react-toastify";

import { useChatStore } from "@/src/common/store/useChatStore";
import { chatService } from "@/src/common/service/chat-service";
import { friendService } from "@/src/common/service/friend-service";
import { AttachmentDto } from "@/src/common/interface/chat-interface";
import DangerZone from "./DangerZone";
import FileSection from "./FileSection";
import LinkSection from "./LinkSection";
import MediaSection from "./MediaSection";
import OverviewCard from "./OverviewCard";
import ProfileCard from "./ProfileCard";
import SecuritySection from "./SecuritySection";
import GroupMemberListView from "./GroupMemberListView";
import AddMemberGroupDialog from "./AddMemberGroupDialog";

interface InfConvColumnProps {
  conversationId: string;
}

const EMPTY_ATTACHMENTS: AttachmentDto[] = [];
const EMPTY_LINKS: string[] = [];

const Root = styled(Box)({
  width: 380,
  minWidth: 380,
  height: "100%",
  background: "#F3F5F7",
  borderLeft: "1px solid #E5E7EB",
  overflowY: "auto",
});

const Header = styled(Box)({
  height: 70,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 16px 0 20px",
  background: "#fff",
  borderBottom: "1px solid #E5E7EB",
  position: "sticky",
  top: 0,
  zIndex: 5,
});

const HeaderTitle = styled(Typography)({
  fontSize: 18,
  fontWeight: 700,
  color: "#0F172A",
});

export default function InfConvColumn({ conversationId }: InfConvColumnProps) {
  const [mounted, setMounted] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [friends, setFriends] = useState<Array<{ id: string; name: string; avatar?: string; phone?: string }>>([]);
  const [memberSearch, setMemberSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const listConversation = useChatStore((s) => s.listConversation);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);
  const fetchListConversation = useChatStore((s) => s.fetchListConversation);
  const currentUserId = useChatStore((s) => s.currentUserId);

  const conversation = listConversation.find((c) => c.id === activeConversationId);
  const isGroup = conversation?.type === "group" || conversation?.type === "GROUP";
  const members = conversation?.members ?? [];

  const currentUserMember = members.find((m: any) => m.userId === currentUserId);
  const currentUserRole = (currentUserMember as any)?.role;
  const isOwner = currentUserRole === "OWNER";
  const isAdmin = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  const mediaItems = useChatStore(
    (state) => state.mediaByConversation?.[conversationId] ?? EMPTY_ATTACHMENTS
  );

  const fileItems = useChatStore(
    (state) => state.filesByConversation?.[conversationId] ?? EMPTY_ATTACHMENTS
  );

  const links = useChatStore(
    (state) => state.linksByConversation?.[conversationId] ?? EMPTY_LINKS
  );

  const refresh = () => fetchListConversation({ page: 1, limit: 20 });

  const loadFriends = useCallback(async () => {
    try {
      const res: any = await friendService.getFriends();
      console.log('[loadFriends] Raw response:', res);
      
      const payload = res?.payload;
      const friendList: any[] = payload?.data ?? [];
      console.log('[loadFriends] Friend list:', friendList);
      
      const existingIds = new Set(members.map((m: any) => m.userId));
      const available = friendList
        .filter((f: any) => !existingIds.has(f.id))
        .map((f: any) => ({
          id: f.id,
          name: f.displayName || f.username || f.id,
          avatar: f.avatarUrl || undefined,
          phone: f.phone || undefined,
        }));
      console.log('[loadFriends] Available friends:', available);
      setFriends(available);
    } catch (err) {
      console.error('[loadFriends] Error:', err);
    }
  }, [members]);

  const handleOpenAddMember = () => {
    loadFriends();
    setShowAddMember(true);
  };

  const handleAddMember = async (userId: string) => {
    const friend = friends.find((f) => f.id === userId);
    try {
      await chatService.addMembers(conversationId, { memberIds: [userId] });
      toast.success(`Đã thêm "${friend?.name || userId}" vào nhóm`);
      setFriends((prev) => prev.filter((f) => f.id !== userId));
      await refresh();
    } catch (error: any) {
      const message = error?.message || error?.response?.data?.message || "Không thể thêm thành viên";
      toast.error(message);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const member = members.find((m: any) => m.userId === memberId);
    const memberName = member?.displayName || member?.username || memberId;
    try {
      await chatService.removeMember(conversationId, memberId);
      toast.success(`Đã xóa "${memberName}" khỏi nhóm`);
      await refresh();
    } catch (error: any) {
      const message = error?.message || error?.response?.data?.message || "Không thể xóa thành viên";
      toast.error(message);
    }
  };

  const handleClose = () => {
    setActiveConversationId(null);
  };

  const handlePromoteToAdmin = async (memberId: string) => {
    const member = members.find((m: any) => m.userId === memberId);
    const memberName = member?.displayName || member?.username || memberId;
    try {
      await chatService.updateMemberRole(conversationId, memberId, 'ADMIN');
      toast.success(`Đã phong "${memberName}" làm quản trị viên`);
      await refresh();
    } catch (error: any) {
      const message = error?.message || error?.response?.data?.message || "Không thể phong quản trị viên";
      toast.error(message);
    }
  };

  const handleDemoteFromAdmin = async (memberId: string) => {
    const member = members.find((m: any) => m.userId === memberId);
    const memberName = member?.displayName || member?.username || memberId;
    try {
      await chatService.updateMemberRole(conversationId, memberId, 'MEMBER');
      toast.success(`Đã hạ quyền "${memberName}" xuống thành viên`);
      await refresh();
    } catch (error: any) {
      const message = error?.message || error?.response?.data?.message || "Không thể hạ quyền quản trị viên";
      toast.error(message);
    }
  };

  const handleTransferOwnership = async (newOwnerId: string) => {
    const newOwner = members.find((m: any) => m.userId === newOwnerId);
    const newOwnerName = newOwner?.displayName || newOwner?.username || newOwnerId;
    try {
      await chatService.transferOwnership(conversationId, newOwnerId);
      toast.success(`Đã chuyển quyền trưởng nhóm cho "${newOwnerName}"`);
      await refresh();
    } catch (error: any) {
      const message = error?.message || error?.response?.data?.message || "Không thể chuyển quyền";
      toast.error(message);
    }
  };

  if (!conversationId) return null;

  if (!mounted) {
    return (
      <Root>
        <Header>
          <HeaderTitle>Thông tin hội thoại</HeaderTitle>
          <Box />
        </Header>
      </Root>
    );
  }

  return (
    <Root>
      <Header>
        <HeaderTitle>Thông tin hội thoại</HeaderTitle>
        <IconButton size="small" onClick={handleClose}>
          <CloseRoundedIcon />
        </IconButton>
      </Header>

      <ProfileCard onAddMember={isGroup ? handleOpenAddMember : undefined} />
      <OverviewCard />

      {isGroup && (
        <GroupMemberListView
          members={members.map((m: any) => ({
            id: m.userId,
            name: m.displayName || m.username || m.userId,
            isOwner: m.role === "OWNER",
            isAdmin: m.role === "OWNER" || m.role === "ADMIN",
          }))}
          totalCount={members.length > 0 ? members.length : (conversation?.memberCount ?? 0)}
          searchValue={memberSearch}
          onSearch={setMemberSearch}
          onRemoveMember={handleRemoveMember}
          onAddMember={handleOpenAddMember}
          onPromoteToAdmin={handlePromoteToAdmin}
          onDemoteFromAdmin={handleDemoteFromAdmin}
          onTransferOwnership={handleTransferOwnership}
          canManageMembers={isAdmin}
          canPromote={isOwner}
        />
      )}

      {isGroup && (
        <AddMemberGroupDialog
          open={showAddMember}
          friends={friends}
          onClose={() => setShowAddMember(false)}
          onAddMember={handleAddMember}
        />
      )}

      <MediaSection items={mediaItems} />
      <FileSection items={fileItems} />
      <LinkSection items={links} />
      <SecuritySection />
      <DangerZone conversationId={conversationId} />
    </Root>
  );
}
