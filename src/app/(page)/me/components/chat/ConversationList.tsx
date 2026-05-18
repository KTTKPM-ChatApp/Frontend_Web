"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Box, CircularProgress, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Group, MoreVert, Person, PushPin, PushPinOutlined, VolumeOff, VolumeUp } from "@mui/icons-material";
import { toast } from "react-toastify";

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
  padding: "9px 12px",
  cursor: "pointer",
  borderRadius: 6,
  marginRight: 8,
  background: active ? "#EAF2FF" : "transparent",
  "&:hover": {
    background: active ? "#EAF2FF" : "#F3F4F6",
  },
}));

const ItemRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 10,
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

const Name = styled(Typography)({
  fontSize: 14,
  fontWeight: 600,
  color: "#111827",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const LastMessage = styled(Typography)({
  fontSize: 12,
  color: "#6B7280",
  marginTop: 3,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const Meta = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 6,
});

const RefreshLimit = { page: 1, limit: 20 };

export default function ConversationList() {
  const authData = useAuthStore((s) => s.authData);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const listConversation = useChatStore((s) => s.listConversation);
  const conversationLoading = useChatStore((s) => s.conversationLoading);
  const conversationFetched = useChatStore((s) => s.conversationFetched);
  const fetchListConversation = useChatStore((s) => s.fetchListConversation);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    fetchListConversation(RefreshLimit);
  }, [fetchListConversation]);

  const displayConversations = useMemo<ConversationDto[]>(() => {
    if (!conversationFetched) return [];
    return [...listConversation].sort((a, b) => {
      const aPinned = (a as any).isPinned || false;
      const bPinned = (b as any).isPinned || false;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [conversationFetched, listConversation]);

  const closeMenu = () => {
    setAnchorEl(null);
    setSelectedConversation(null);
  };

  const refresh = () => fetchListConversation(RefreshLimit);

  const handleToggleMute = async (conversationId: string, isMuted: boolean) => {
    try {
      await chatService.updateConversationSettings(conversationId, { isMuted: !isMuted });
      toast.success(isMuted ? "Đã bật thông báo" : "Đã tắt thông báo");
      await refresh();
    } catch (error) {
      toast.error("Không thể thay đổi cài đặt thông báo");
    } finally {
      closeMenu();
    }
  };

  const handleTogglePin = async (conversationId: string, isPinned: boolean) => {
    try {
      if (isPinned) {
        await chatService.unpinConversation(conversationId);
        toast.success("Đã bỏ ghim cuộc trò chuyện");
      } else {
        await chatService.pinConversation(conversationId);
        toast.success("Đã ghim cuộc trò chuyện");
      }
      await refresh();
    } catch (error) {
      toast.error("Không thể thay đổi cài đặt ghim");
    } finally {
      closeMenu();
    }
  };

  if (conversationLoading && !conversationFetched) {
    return (
      <Root>
        <LoadingWrap>
          <CircularProgress size={20} />
          <LoadingText>Đang tải danh sách cuộc trò chuyện...</LoadingText>
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
          return (
            <Item
              key={item.id}
              active={isActive}
              data-testid="conversation"
              onClick={() => openConversation(item.id)}
            >
              <ItemRow>
                <AppAvatar src={item.avatarUrl ?? ""} name={item.name ?? null} size={44} />
                <Content>
                  <Row>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                      {isPinned && <PushPin sx={{ fontSize: 13, color: "#2563EB" }} />}
                      <Name>{item.name || "Cuộc trò chuyện"}</Name>
                    </Box>
                    <Meta>
                      {item.type === "group" ? <Group sx={{ fontSize: 12, color: "#64748B" }} /> : <Person sx={{ fontSize: 12, color: "#64748B" }} />}
                      {isMuted && <VolumeOff sx={{ fontSize: 14, color: "#64748B" }} />}
                      {!!item.unreadCount && (
                        <Badge color="primary" badgeContent={item.unreadCount} />
                      )}
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          setAnchorEl(event.currentTarget);
                          setSelectedConversation(item.id);
                        }}
                      >
                        <MoreVert sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Meta>
                  </Row>

                  <LastMessage>
                    {item?.lastMessage?.content
                      ? `${item?.lastMessage?.senderId === authData?.data?.user?.id ? "Bạn: " : ""}${item.lastMessage.content}`
                      : "Chưa có tin nhắn"}
                  </LastMessage>
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
        {selectedConversation &&
          (() => {
            const conversation = displayConversations.find((item) => item.id === selectedConversation);
            const isMuted = (conversation as any)?.isMuted || false;
            const isPinned = (conversation as any)?.isPinned || false;
            return (
              <>
                <MenuItem onClick={() => handleToggleMute(selectedConversation, isMuted)}>
                  {isMuted ? (
                    <>
                      <VolumeUp sx={{ mr: 1.5, fontSize: 18 }} />
                      Bật thông báo
                    </>
                  ) : (
                    <>
                      <VolumeOff sx={{ mr: 1.5, fontSize: 18 }} />
                      Tắt thông báo
                    </>
                  )}
                </MenuItem>
                <MenuItem onClick={() => handleTogglePin(selectedConversation, isPinned)}>
                  {isPinned ? (
                    <>
                      <PushPinOutlined sx={{ mr: 1.5, fontSize: 18 }} />
                      Bỏ ghim
                    </>
                  ) : (
                    <>
                      <PushPin sx={{ mr: 1.5, fontSize: 18 }} />
                      Ghim cuộc trò chuyện
                    </>
                  )}
                </MenuItem>
              </>
            );
          })()}
      </Menu>
    </>
  );
}
