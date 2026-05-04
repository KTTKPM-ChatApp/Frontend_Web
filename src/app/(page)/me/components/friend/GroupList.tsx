"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";

import { useChatStore } from "@/src/common/store/useChatStore";
import { useTrans } from "@/src/common/utilities/hook/trans";

const Root = styled(Box)({
  height: "100%",
  background: "#F3F5F7",
  display: "flex",
  flexDirection: "column",
});

const Header = styled(Box)({
  height: 76,
  background: "#FFFFFF",
  borderBottom: "1px solid #E5E7EB",
  display: "flex",
  alignItems: "center",
  padding: "0 20px",
  gap:"8px"
});

const HeaderTitle = styled(Typography)({
  fontSize: "16px",
  fontWeight: 600,
  color: "#0F172A",
});

const Content = styled(Box)({
  flex: 1,
  padding: 20,
  overflowY: "auto",
});

const SectionTitle = styled(Typography)({
  fontSize: 16,
  fontWeight: 700,
  color: "#0F172A",
  marginBottom: 14,
});

const FilterWrap = styled(Box)({
  padding: 16,
  background: "#FFFFFF",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  marginBottom: 16,
});

const EmptyWrap = styled(Box)({
  height: 260,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748B",
});

function normalizeText(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function getConversationAvatar(item: any) {
  return item?.avatarUrl || item?.avatar || item?.imageUrl || null;
}

function getConversationMemberCount(item: any) {
  return (
    item?.memberCount ||
    item?.participantCount ||
    item?.members?.length ||
    item?.participants?.length ||
    0
  );
}

function getLastMessageText(item: any) {
  if (typeof item?.lastMessage === "string") return item.lastMessage;
  if (item?.lastMessage?.content) return item.lastMessage.content;
  return "Chưa có tin nhắn";
}

function isGroupConversation(item: any) {
  if (item?.type === "group") return true;
  if (item?.conversationType === "group") return true;
  if (item?.isGroup === true) return true;
  if (getConversationMemberCount(item) > 2) return true;
  return false;
}

export default function GroupList() {
  const t = useTrans();
  const [keyword, setKeyword] = useState("");

  const listConversation = useChatStore((s) => s.listConversation);
  const conversationLoading = useChatStore((s) => s.conversationLoading);
  const fetchListConversation = useChatStore((s) => s.fetchListConversation);

  const getConversationName = (item: any) => {
    return item?.name || item?.title || item?.conversationName || t("FRIEND.GROUP_NO_NAME");
  };

  useEffect(() => {
    void fetchListConversation({ page: 1, limit: 100 });
  }, [fetchListConversation]);

  const groups = useMemo(() => {
    return (listConversation || []).filter(isGroupConversation);
  }, [listConversation]);

  const filteredGroups = useMemo(() => {
    const q = normalizeText(keyword);
    if (!q) return groups;

    return groups.filter((item: any) => {
      const name = normalizeText(getConversationName(item));
      return name.includes(q);
    });
  }, [groups, keyword]);

  return (
    <Root>
      <Header>
        <GroupsOutlinedIcon/>
        <HeaderTitle>{t("FRIEND.GROUP_TITLE")}</HeaderTitle>
      </Header>

      <Content>
        <SectionTitle>{t("FRIEND.GROUP_SECTION").replace("{count}", String(groups.length))}</SectionTitle>

        <FilterWrap>
          <TextField
            fullWidth
            size="small"
            placeholder={t("FRIEND.SEARCH_GROUP")}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#64748B" }} />
                </InputAdornment>
              ),
            }}
          />
        </FilterWrap>

        {conversationLoading ? (
          <EmptyWrap>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={22} />
              <Typography>{t("FRIEND.GROUP_LOADING")}</Typography>
            </Stack>
          </EmptyWrap>
        ) : filteredGroups.length === 0 ? (
          <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
            <EmptyWrap>
              <Typography>{t("FRIEND.NO_GROUPS")}</Typography>
            </EmptyWrap>
          </Card>
        ) : (
          <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
            {filteredGroups.map((group: any, index: number) => (
              <CardContent
                key={group.id || group.conversationId || index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  borderBottom:
                    index < filteredGroups.length - 1 ? "1px solid #F1F5F9" : "none",
                }}
              >
                <Avatar
                  src={getConversationAvatar(group) || undefined}
                  alt={getConversationName(group)}
                  sx={{ width: 48, height: 48 }}
                >
                  {getConversationName(group).charAt(0).toUpperCase()}
                </Avatar>

                <Box>
                  <Typography
                    sx={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}
                  >
                    {getConversationName(group)}
                  </Typography>

                  <Typography sx={{ fontSize: 13, color: "#64748B", mt: 0.5 }}>
                    {getConversationMemberCount(group)} {t("CONVO.MEMBERS")}
                  </Typography>

                  <Typography sx={{ fontSize: 13, color: "#475569", mt: 1 }}>
                    {getLastMessageText(group)}
                  </Typography>
                </Box>
              </CardContent>
            ))}
          </Card>
        )}
      </Content>
    </Root>
  );
}