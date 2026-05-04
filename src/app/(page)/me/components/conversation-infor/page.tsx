"use client";

import { useEffect, useState } from "react";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { fetchListConversation } from "@/src/common/action/chat.action";
import { useTrans } from "@/src/common/utilities/hook/trans";
import { useChatStore } from "@/src/common/store/useChatStore";
import { AttachmentDto, ConversationMemberDto } from "@/src/common/interface/chat-interface";
import DangerZone from "./DangerZone";
import FileSection from "./FileSection";
import LinkSection from "./LinkSection";
import MediaSection from "./MediaSection";
import OverviewCard from "./OverviewCard";
import ProfileCard from "./ProfileCard";
import SecuritySection from "./SecuritySection";
import GroupMemberBlock from "./GroupMemberBlock";
import GroupMemberListView from "./GroupMemberListView";
import { groupService } from "@/src/common/service/group-service";
import AddMemberGroupDialog from "./AddMemberGroupDialog";
import AppModal from "@/src/shared/component/AppModal";
import MediaPreviewModal, { MediaPreviewItem } from "@/src/common/components/MediaPreviewModal";

interface InfConvColumnProps {
  conversationId: string;
}

const EMPTY_ATTACHMENTS: AttachmentDto[] = [];
const EMPTY_LINKS: string[] = [];

const Root = styled(Box)({
  width: 360,
  minWidth: 360,
  height: "100%",
  background: "#F3F5F7",
  borderLeft: "1px solid #E5E7EB",
  overflowY: "auto",
});

const Header = styled(Box)({
  height: 70,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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

export default function InfConvColumn({
  conversationId,
}: InfConvColumnProps) {
  const t = useTrans();
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"overview" | "members">("overview");
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ConversationMemberDto | null>(null);
  const [openConfirmRemove, setOpenConfirmRemove] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaPreviewItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const currentUserId = useChatStore((s) => s.currentUserId);

  const handleOpenRemoveMember = (member: ConversationMemberDto) => {
    setSelectedMember(member);
    setOpenConfirmRemove(true);
  };

  const handleConfirmRemove = async () => {
    if (!conversationId || !selectedMember) return;

    await groupService.removeMemberFromGroup(conversationId, selectedMember.userId);
    await fetchConversationDetail(conversationId, true);
    setOpenConfirmRemove(false);
    setSelectedMember(null);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setView("overview");
  }, [conversationId]);

  const mediaItems = useChatStore(
    (state) => state.mediaByConversation?.[conversationId] ?? EMPTY_ATTACHMENTS
  );

  const fileItems = useChatStore(
    (state) => state.filesByConversation?.[conversationId] ?? EMPTY_ATTACHMENTS
  );

  const links = useChatStore(
    (state) => state.linksByConversation?.[conversationId] ?? EMPTY_LINKS
  );

  const conversationDetail = useChatStore(
    (state) => state.conversationDetailById?.[conversationId] ?? null
  );

  const fetchConversationDetail = useChatStore((state) => state.fetchConversationDetail);

  const isGroup = conversationDetail?.type === "group";
  const members = conversationDetail?.members ?? [];
  const myMember = members.find((member) => member.userId === currentUserId);
  const myRole = myMember?.role;

  const handleBackToOverview = () => {
    setView("overview");
  };

  const handleOpenAddMemberDialog = () => {
    setOpenAddMemberDialog(true);
  };

  if (!conversationId) return null;

  if (!mounted) {
    return (
      <Root>
        <Header>
          <HeaderTitle>{t("COMMON.CONVO_INFO_CHAT")}</HeaderTitle>
        </Header>
      </Root>
    );
  }

  return (
    <Root>
      {view === "overview" ? (
        <>
          <Header>
            <HeaderTitle>{isGroup ? t("COMMON.CONVO_INFO_GROUP") : t("COMMON.CONVO_INFO_CHAT")}</HeaderTitle>
          </Header>

          <ProfileCard />
          {isGroup ? null : <OverviewCard />}

          {isGroup && (
            <GroupMemberBlock
              memberCount={members.length}
              onClick={() => setView("members")}
            />
          )}

          <MediaSection
            items={mediaItems}
            onMediaClick={(media) => {
              setPreviewMedia(media);
              setPreviewOpen(true);
            }}
          />
          <FileSection items={fileItems} />
          <LinkSection items={links} />
          <SecuritySection />
          <DangerZone />
        </>
      ) : (
        <GroupMemberListView
          onBack={handleBackToOverview}
          onOpenAddMember={handleOpenAddMemberDialog}
          onRemoveMember={handleOpenRemoveMember}
          onUpdateMemberRole={async (member, role) => {
            await groupService.updateMemberRole(conversationId, member.userId, role);
            await fetchConversationDetail(conversationId, true);
          }}
        />
      )}

      <AddMemberGroupDialog
        open={openAddMemberDialog}
        onClose={() => setOpenAddMemberDialog(false)}
        existingMemberIds={members.map((m) => m.userId)}
        onSubmit={async (userIds) => {
          await groupService.addMembersToGroup(conversationId, userIds);
          await fetchConversationDetail(conversationId, true);
        }}
      />
      <AppModal
        open={openConfirmRemove}
        onClose={() => setOpenConfirmRemove(false)}
        title={t("CONVO.DELETE_MEMBER")}
        headerDivider
        actions={
          <>
            <Button onClick={() => setOpenConfirmRemove(false)}>{t("COMMON.BACK")}</Button>
            <Button color="error" variant="contained" onClick={handleConfirmRemove}>
              {t("CONVO.DELETE_MEMBER")}
            </Button>
          </>
        }
      >
        <Typography>
          {t("CONVO.REMOVE_MEMBER_CONFIRM").replace("{name}", selectedMember?.nickname || selectedMember?.fullName || "")}
        </Typography>
      </AppModal>

      {/* Media Preview Modal */}
      <MediaPreviewModal
        open={previewOpen}
        media={previewMedia}
        mediaList={mediaItems.map((item) => ({
          key: item.key,
          name: item.name,
          type: item.type,
        }))}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewMedia(null);
        }}
      />
    </Root>
  );
}