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

  const conversation = listConversation.find((c) => c.id === activeConversationId);
  const isGroup = conversation?.type === "group";
  const members = conversation?.members ?? [];

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
      const res = await friendService.getFriends();
      const friendList: any[] = res?.data ?? [];
      const existingIds = new Set(members.map((m: any) => m.userId));
      const available = friendList
        .filter((f: any) => !existingIds.has(f.id))
        .map((f: any) => ({
          id: f.id,
          name: f.displayName,
          avatar: f.avatarUrl || undefined,
          phone: f.phone || undefined,
        }));
      setFriends(available);
    } catch {}
  }, [members]);

  const handleOpenAddMember = () => {
    loadFriends();
    setShowAddMember(true);
  };

  const handleAddMember = async (userId: string) => {
    try {
      await chatService.addMembers(conversationId, { memberIds: [userId] });
      toast.success("Đã thêm thành viên");
      setFriends((prev) => prev.filter((f) => f.id !== userId));
      await refresh();
    } catch {
      toast.error("Không thể thêm thành viên");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await chatService.removeMember(conversationId, memberId);
      toast.success("Đã xóa thành viên");
      await refresh();
    } catch {
      toast.error("Không thể xóa thành viên");
    }
  };

  const handleClose = () => {
    setActiveConversationId(null);
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
            isAdmin: m.role === "OWNER" || m.role === "ADMIN",
          }))}
          totalCount={conversation?.memberCount ?? members.length}
          searchValue={memberSearch}
          onSearch={setMemberSearch}
          onRemoveMember={handleRemoveMember}
          onAddMember={handleOpenAddMember}
        />
      )}

      {isGroup && (
        <AddMemberGroupDialog
          open={showAddMember}
          availableMembers={friends}
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
