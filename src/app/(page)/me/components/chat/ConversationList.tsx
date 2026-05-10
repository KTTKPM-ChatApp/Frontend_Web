"use client";

import { openConversation, openMockConversation } from "@/src/common/action/chat.action";
import { ConversationDto } from "@/src/common/interface/chat-interface";
import { mockConversations } from "@/src/common/mockData/chat.mock.data";
import { useAuthStore } from "@/src/common/store/useAuthStore";
import { useChatStore } from "@/src/common/store/useChatStore";
import AppAvatar from "@/src/shared/component/Avatar";
import {
  Avatar,
  Badge,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useMemo } from "react";

const Root = styled(Box)({
  width: "100%",
  height: "100%",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

const LoadingWrap = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
  gap: 12,
});

const LoadingText = styled(Typography)({
  fontSize: 13,
  color: "#6B7280",
});

const Item = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ active }) => ({
  padding: "12px 16px",
  cursor: "pointer",
  borderRadius: "6px",
  background: active ? "#E5F1FF" : "#fff",
  "&:hover": {
    background: active ? "#E5F1FF" : "#f1f2f4",
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
  marginTop: 4,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});


export default function ConversationList() {
  const authData = useAuthStore((s) => s.authData);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const listConversation = useChatStore((s) => s.listConversation);
  const conversationLoading = useChatStore((s) => s.conversationLoading);
  const conversationFetched = useChatStore((s) => s.conversationFetched);
  const fetchListConversation = useChatStore((s) => s.fetchListConversation);
  console.log("render conversation list", listConversation);
  useEffect(() => {
    fetchListConversation({ page: 1, limit: 10 });
  }, [fetchListConversation]);

  const usingApiData = listConversation.length > 0;

  const displayConversations = useMemo<ConversationDto[]>(() => {
    if (!conversationFetched) return [];
    return usingApiData ? listConversation : mockConversations;
  }, [conversationFetched, usingApiData, listConversation]);

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
    <Root>
      {displayConversations.map((item) => (
        <Item
          data-testid="conversation"
          key={item.id}
          active={activeConversationId === item.id}
          onClick={() =>
            usingApiData
              ? openConversation(item.id)
              : openMockConversation(item.id)
          }
        >
          <ItemRow>
            <AppAvatar
              src={item.avatarUrl ?? ""}
              name={item.name ?? null}
              size={44}
            />

            <Content>
              <Row>
                <Name>{item.name}</Name>
                {!!item.unreadCount && (
                  <Badge color="primary" badgeContent={item.unreadCount} />
                )}
              </Row>

              <LastMessage>
                {item?.lastMessage?.content
                  ? `${item?.lastMessage?.senderId === authData?.data?.user?.id ? "Bạn: " : ""}${item.lastMessage.content}`
                  : "Chưa có tin nhắn"}
              </LastMessage>
            </Content>
          </ItemRow>
        </Item>
      ))}
    </Root>
  );
}