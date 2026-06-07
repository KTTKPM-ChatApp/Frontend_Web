"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Group, MoreVert, Person, PushPin, PushPinOutlined, VolumeOff, VolumeUp } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTrans } from "@/src/common/utilities/hook/trans";
import { resolveMediaUrl } from "@/src/common/helpers/displayMedia.helpers";

import { openConversation } from "@/src/common/action/chat.action";
import { ConversationDto } from "@/src/common/interface/chat-interface";
import { chatService } from "@/src/common/service/chat-service";
import { useAuthStore } from "@/src/common/store/useAuthStore";
import { useChatStore } from "@/src/common/store/useChatStore";
import AppAvatar from "@/src/shared/component/Avatar";

const Root = styled(Box)({
  width: "100%",
  height: "100%",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
});

const LoadingWrap = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 28,
  gap: 10,
});

const LoadingText = styled(Typography)({
  fontSize: 13,
  color: "#6B7280",
});

const Item = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ active }) => ({
  padding: "12px 14px",
  cursor: "pointer",
  borderRadius: 8,
  marginRight: 8,
  marginBottom: 4,
  background: active ? "rgba(0, 90, 224, 0.08)" : "transparent",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  borderLeft: active ? "3px solid #005ae0" : "3px solid transparent",
  paddingLeft: active ? "11px" : "14px",
  "&:hover": {
    background: active ? "rgba(0, 90, 224, 0.12)" : "rgba(15, 23, 42, 0.04)",
  },
  "&:hover .more-btn": {
    opacity: 1,
    visibility: "visible",
  },
  "&:hover .time-text": {
    opacity: 0,
    visibility: "hidden",
  },
}));

const ItemRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
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

const Name = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "unread",
})<{ unread?: boolean }>(({ unread }) => ({
  fontSize: "14px",
  fontWeight: unread ? 700 : 500,
  color: unread ? "#0F172A" : "#334155",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  transition: "color 0.2s ease",
}));

const LastMessage = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "unread",
})<{ unread?: boolean }>(({ unread }) => ({
  fontSize: "12px",
  fontWeight: unread ? 600 : 400,
  color: unread ? "#1E293B" : "#64748B",
  marginTop: 3,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  transition: "color 0.2s ease",
}));

const UnreadCountBadge = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#005ae0",
  color: "#fff",
  minWidth: 16,
  height: 16,
  borderRadius: 8,
  padding: "0 4px",
  fontSize: 9,
  fontWeight: 700,
  lineHeight: 1,
  boxShadow: "0 2px 4px rgba(0, 90, 224, 0.3)",
  animation: "scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
  "@keyframes scaleIn": {
    "0%": { transform: "scale(0.5)", opacity: 0 },
    "100%": { transform: "scale(1)", opacity: 1 },
  },
});

const Meta = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 4,
  position: "relative",
});

const TimeText = styled(Typography)({
  fontSize: "11px",
  color: "#94A3B8",
  whiteSpace: "nowrap",
  transition: "opacity 0.15s ease, visibility 0.15s ease",
});

const formatLastMessageTime = (dateStr?: string | number | null, t?: any) => {
  if (!dateStr) return "";
  try {
    const date = new Date(typeof dateStr === "number" ? dateStr : String(dateStr));
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return t ? t("COMMON.YESTERDAY") || "Yesterday" : "Yesterday";
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return "";
  }
};

const RefreshLimit = { page: 1, limit: 20 };

interface ConversationListProps {
  filterUnread?: boolean;
}

export default function ConversationList({ filterUnread = false }: ConversationListProps) {
  const authData = useAuthStore((s) => s.authData);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const listConversation = useChatStore((s) => s.listConversation);
  const conversationLoading = useChatStore((s) => s.conversationLoading);
  const conversationFetched = useChatStore((s) => s.conversationFetched);
  const fetchListConversation = useChatStore((s) => s.fetchListConversation);

  const t = useTrans();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    fetchListConversation(RefreshLimit);
  }, [fetchListConversation]);

  const displayConversations = useMemo<ConversationDto[]>(() => {
    if (!conversationFetched) return [];
    const sorted = [...listConversation].sort((a, b) => {
      const aPinned = (a as any).isPinned || false;
      const bPinned = (b as any).isPinned || false;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
    return filterUnread ? sorted.filter((c) => (c.unreadCount ?? 0) > 0) : sorted;
  }, [conversationFetched, listConversation, filterUnread]);

  const closeMenu = () => {
    setAnchorEl(null);
    setSelectedConversation(null);
  };

  const refresh = () => fetchListConversation(RefreshLimit);

  const handleToggleMute = async (conversationId: string, isMuted: boolean) => {
    try {
      await chatService.updateConversationSettings(conversationId, { isMuted: !isMuted });
      toast.success(isMuted ? t("CHAT.NOTIFICATION_ON") : t("CHAT.NOTIFICATION_OFF"));
      await refresh();
    } catch (error) {
      toast.error(t("CHAT.NOTIFICATION_ERROR"));
    } finally {
      closeMenu();
    }
  };

  const handleTogglePin = async (conversationId: string, isPinned: boolean) => {
    try {
      if (isPinned) {
        await chatService.unpinConversation(conversationId);
        toast.success(t("CHAT.UNPIN_SUCCESS"));
      } else {
        await chatService.pinConversation(conversationId);
        toast.success(t("CHAT.PIN_SUCCESS"));
      }
      await refresh();
    } catch (error) {
      toast.error(t("CHAT.PIN_ERROR"));
    } finally {
      closeMenu();
    }
  };

  if (conversationLoading && !conversationFetched) {
    return (
      <Root>
        <LoadingWrap>
          <CircularProgress size={20} />
          <LoadingText>{t("CHAT.LOADING_CONVERSATIONS")}</LoadingText>
        </LoadingWrap>
      </Root>
    );
  }

  return (
    <>
      <Root>
        {displayConversations.map((item) => {
          const isPinned = (item as any).isPinned || false;
          const isMuted = (item as any).isMuted || false;
          const isActive = activeConversationId === item.id;
          const isGroup = item.type === "group" || item.type === "GROUP";
          
          const otherMember = !isGroup
            ? item.members?.find((m) => m.userId !== authData?.data?.user?.id)
            : null;
          const rawAvatarSrc = isGroup
            ? item.avatarUrl
            : otherMember?.avatarUrl || item.avatarUrl;
          const avatarSrc = resolveMediaUrl(rawAvatarSrc) || undefined;
          const isUnread = !!item.unreadCount;

          return (
            <Item
              key={item.id}
              active={isActive}
              data-testid="conversation"
              onClick={() => openConversation(item.id)}
            >
              <ItemRow>
                <AppAvatar 
                  src={avatarSrc}
                  name={item.name ?? null} 
                  size={44} 
                  isGroup={isGroup}
                />
                <Content>
                  <Row>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                      {isPinned && (
                        <PushPin
                          sx={{ fontSize: 13, color: "#2563EB", cursor: "pointer", "&:hover": { opacity: 0.7 } }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin(item.id, isPinned);
                          }}
                        />
                      )}
                      <Name unread={isUnread}>{item.name || t("CHAT.CONVERSATION")}</Name>
                    </Box>
                    <Meta sx={{ minWidth: 46, justifyContent: "flex-end", height: 20 }}>
                      {(item.type === "group" || item.type === "GROUP") ? (
                        <Group sx={{ fontSize: 14, color: "#94A3B8" }} />
                      ) : (
                        <Person sx={{ fontSize: 14, color: "#94A3B8" }} />
                      )}
                      {isMuted && (
                        <VolumeOff
                          sx={{ fontSize: 13, color: "#94A3B8", cursor: "pointer", "&:hover": { opacity: 0.7 } }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleMute(item.id, isMuted);
                          }}
                        />
                      )}
                      
                      <TimeText className="time-text">
                        {formatLastMessageTime(item.lastMessageAt || item.lastMessage?.createdAt, t)}
                      </TimeText>
                      
                      <IconButton
                        className="more-btn"
                        size="small"
                        sx={{
                          opacity: 0,
                          visibility: "hidden",
                          position: "absolute",
                          right: -4,
                          p: 0.25,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: isActive ? "rgba(224, 242, 254, 0.9)" : "rgba(255, 255, 255, 0.9)",
                          backdropFilter: "blur(4px)",
                          "&:hover": {
                            backgroundColor: isActive ? "rgba(224, 242, 254, 1)" : "#F1F2F4",
                          },
                          transition: "opacity 0.2s ease, visibility 0.2s ease",
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          setAnchorEl(event.currentTarget);
                          setSelectedConversation(item.id);
                        }}
                      >
                        <MoreVert sx={{ fontSize: 16, color: "#64748B" }} />
                      </IconButton>
                    </Meta>
                  </Row>

                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "3px" }}>
                    <LastMessage unread={isUnread} sx={{ mt: 0, flex: 1, mr: 1 }}>
                      {item?.lastMessage?.content
                        ? (() => {
                            const isMine = item.lastMessage!.senderId === authData?.data?.user?.id;
                            const isGroup = item.type === "GROUP" || item.type === "group";
                            if (!isMine && isGroup && item.lastMessage!.senderName) {
                              return `${item.lastMessage!.senderName}: ${item.lastMessage!.content}`;
                            }
                            return `${isMine ? t("CHAT.YOU") + ": " : ""}${item.lastMessage!.content}`;
                          })()
                        : t("CHAT.NO_MESSAGES")}
                    </LastMessage>
                    {isUnread && (
                      <UnreadCountBadge>{item.unreadCount}</UnreadCountBadge>
                    )}
                  </Box>
                </Content>
              </ItemRow>
            </Item>
          );
        })}
      </Root>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {selectedConversation ? (() => {
            const conversation = displayConversations.find((item) => item.id === selectedConversation);
            const isMuted = (conversation as any)?.isMuted || false;
            const isPinned = (conversation as any)?.isPinned || false;
            return (
              <Box>
                <MenuItem onClick={() => handleToggleMute(selectedConversation, isMuted)}>
                  {isMuted ? (
                    <>
                      <VolumeUp sx={{ mr: 1.5, fontSize: 18 }} />
                      {t("CHAT.TURN_ON_NOTIFICATION")}
                    </>
                  ) : (
                    <>
                      <VolumeOff sx={{ mr: 1.5, fontSize: 18 }} />
                      {t("CHAT.TURN_OFF_NOTIFICATION")}
                    </>
                  )}
                </MenuItem>
                <MenuItem onClick={() => handleTogglePin(selectedConversation, isPinned)}>
                  {isPinned ? (
                    <>
                      <PushPinOutlined sx={{ mr: 1.5, fontSize: 18 }} />
                      {t("CHAT.UNPIN")}
                    </>
                  ) : (
                    <>
                      <PushPin sx={{ mr: 1.5, fontSize: 18 }} />
                      {t("CHAT.PIN_CONVERSATION")}
                    </>
                  )}
                </MenuItem>
              </Box>
            );
          })() : null}
      </Menu>
    </>
  );
}
