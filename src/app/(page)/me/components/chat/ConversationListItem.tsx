"use client";

import { memo, useMemo, useState } from "react";
import { Badge, Box, IconButton, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import AppAvatar, { buildS3Url } from "@/src/shared/component/Avatar";
import type { ConversationDto } from "@/src/common/interface/chat-interface";
import { getConversationLastMessageText } from "@/src/common/helpers/conversation.helpers";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import { chatService } from "@/src/common/service/chat-service";
import { useChatStore } from "@/src/common/store/useChatStore";
import MenuPopover from "@/src/shared/component/MenuPopover";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface ConversationListItemProps {
  item: ConversationDto;
  active?: boolean;
  currentUserId?: string | null;
  onOpen: (conversationId: string) => void;
}

const Item = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ active }) => ({
  position: "relative",
  padding: "12px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  cursor: "pointer",
  borderRadius: "6px",
  background: active ? "#E5F1FF" : "#fff",
  transition: "background 0.2s ease",
  "&:hover": {
    background: active ? "#E5F1FF" : "#F1F2F4",
  },
}));

const ItemRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  maxWidth: 336,
});

const Content = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const Row = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
});

const NameWrap = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 6,
  minWidth: 0,
  flex: 1,
});

const GroupBadge = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 2,
  background: "#E8F5E9",
  color: "#2E7D32",
  padding: "2px 6px",
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 500,
});

const Name = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "isGroup",
})<{ isGroup?: boolean }>(({ isGroup }: { isGroup?: boolean }) => ({
  fontSize: 14,
  fontWeight: isGroup ? 500 : 600,
  color: isGroup ? "#1565C0" : "#111827",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  minWidth: 0,
}));

const LastMessage = styled(Typography)({
  fontSize: 12,
  color: "#6B7280",
  marginTop: 4,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const UnreadCountBadge = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#005ae0",
  color: "#fff",
  minWidth: 20,
  height: 20,
  borderRadius: 10,
  padding: "0 6px",
  fontSize: 11,
  fontWeight: 600,
  lineHeight: 1,
});

function ConversationListItem({
  item,
  active,
  currentUserId,
  onOpen,
}: ConversationListItemProps) {
  const updateConversationPinStatus = useChatStore(
    (s) => s.updateConversationPinStatus
  );

  const t = useTrans();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const openMenu = Boolean(anchorEl);

  const lastMessageText = useMemo(
    () => getConversationLastMessageText(item, currentUserId),
    [item, currentUserId]
  );

  const handleOpenMenuConversationPopover = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenuConversationPopover = () => {
    setAnchorEl(null);
  };

  const handleTogglePinConversation = async () => {
    try {
      if (item.isPinned) {
        await chatService.unpinConversation(item.id);
        updateConversationPinStatus(item.id, false);
      } else {
        await chatService.pinConversation(item.id);
        updateConversationPinStatus(item.id, true);
      }

      handleCloseMenuConversationPopover();
    } catch (error) {
      console.error("Pin/unpin conversation failed", error);
    }
  };
  const isGroup = item.type === "group" || item.type === "GROUP";

  const otherMember = !isGroup
    ? item.members?.find((m) => m.userId !== currentUserId)
    : null;

  const displayName = isGroup
    ? item.title
    : otherMember?.nickname || otherMember?.fullName || item.title;

  const displaySrc = isGroup
    ? buildS3Url(item.avatarUrl)
    : buildS3Url(otherMember?.avatarUrl || item.avatarUrl);


  return (
    <>
      <Item
        data-testid="conversation"
        active={active}
        onClick={() => onOpen(item.id)}
      >
        <ItemRow>
          <AppAvatar
            src={displaySrc}
            name={displayName ?? null}
            size={44}
            isGroup={isGroup}
          />

          <Content>
            <Row>
              <NameWrap>
                {isGroup && (
                  <GroupsIcon sx={{ fontSize: 16, color: "#1565C0", flexShrink: 0 }} />
                )}
                <Name isGroup={isGroup}>{item.title}</Name>
                {isGroup && item.memberCount && (
                  <GroupBadge>
                    {t("CHAT.MEMBER_COUNT", { count: item.memberCount })}
                  </GroupBadge>
                )}
              </NameWrap>
            </Row>

            <LastMessage>{lastMessageText}</LastMessage>
          </Content>
        </ItemRow>
        
        <Stack alignItems="flex-end" justifyContent="space-between" sx={{ height: 44, minWidth: 40, flexShrink: 0 }}>
          <IconButton
            size="small"
            sx={{
              p: 0.25,
              mt: -0.5,
              mr: -0.5,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenMenuConversationPopover(e);
            }}
          >
            <MoreHorizOutlinedIcon sx={{ fontSize: "16px" }} />
          </IconButton>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            {item.isPinned && (
              <PushPinOutlinedIcon
                sx={{ fontSize: 14, color: "#6B7280", rotate: "45deg" }}
              />
            )}
            {!!item.unreadCount && (
              <UnreadCountBadge>{item.unreadCount}</UnreadCountBadge>
            )}
          </Stack>
        </Stack>

      </Item>

      <MenuPopover
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenuConversationPopover}
        items={[
          {
            key: "pin-toggle",
            label: item.isPinned ? t("COMMON.UNPIN_CHAT") : t("COMMON.PIN_CHAT"),
            onClick: handleTogglePinConversation,
          },
        ]}
      />
    </>
  );
}

export default memo(ConversationListItem);