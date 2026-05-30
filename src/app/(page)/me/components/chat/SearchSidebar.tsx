"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, TextField, IconButton, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import { useChatStore } from "@/src/common/store/useChatStore";
import { chatService } from "@/src/common/service/chat-service";
import { useTrans } from "@/src/common/utilities/hook/trans";

const SearchContainer = styled(Box)({
  width: 320,
  height: "100%",
  borderLeft: "1px solid #E5E7EB",
  backgroundColor: "#FFFFFF",
  display: "flex",
  flexDirection: "column",
});

const SearchHeader = styled(Box)({
  padding: "14px 12px",
  borderBottom: "1px solid #E5E7EB",
});

const SearchContent = styled(Box)({
  flex: 1,
  overflowY: "auto",
  padding: "10px",
});

const ResultItem = styled(Box)({
  borderRadius: 8,
  marginBottom: 8,
  padding: "10px",
  border: "1px solid #F1F5F9",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#F8FAFC",
  },
});

const MessagePreview = styled(Typography)({
  fontSize: 13,
  color: "#334155",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  marginBottom: 4,
});

interface Message {
  messageId: string;
  body: string;
  createdAt: string;
  senderId: string;
  isDeleted?: boolean;
}

interface SearchSidebarProps {
  conversationId: string | null;
  onClose: () => void;
  onMessageClick: (message: Message) => void;
}

const normalize = (value: string) => value.toLowerCase().trim();

const SearchSidebar: React.FC<SearchSidebarProps> = ({ conversationId, onClose, onMessageClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [apiResults, setApiResults] = useState<Message[] | null>(null);
  const [searching, setSearching] = useState(false);
  const messagesByConversation = useChatStore((s) => s.messagesByConversation);
  const t = useTrans();

  const allMessages = conversationId ? messagesByConversation[conversationId] || [] : [];
  const searchResults = useMemo(() => {
    const keyword = normalize(searchQuery);
    if (!keyword) return [];

    return [...allMessages]
      .reverse()
      .filter((msg) => normalize(msg.body || "").includes(keyword))
      .slice(0, 50)
      .map((msg) => ({
        messageId: msg.messageId,
        body: msg.body,
        createdAt: new Date(msg.createdAt).toISOString(),
        senderId: msg.senderId,
        isDeleted: msg.isDeleted,
      }));
  }, [allMessages, searchQuery]);

  const finalResults = apiResults ?? searchResults;

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!conversationId || !searchQuery.trim()) {
        if (mounted) setApiResults(null);
        return;
      }
      try {
        setSearching(true);
        const res = await chatService.searchMessages(conversationId, { q: searchQuery.trim() });
        const rows = (res?.payload as any)?.data;
        if (!Array.isArray(rows)) {
          if (mounted) setApiResults(null);
          return;
        }
        const normalized = rows.map((item: any) => ({
          messageId: item.messageId || item.id,
          body: item.body || item.content || "",
          createdAt: new Date(item.createdAt || item.created_at || Date.now()).toISOString(),
          senderId: item.senderId || item.sender_id || "",
          isDeleted: Boolean(item.isDeleted),
        }));
        if (mounted) setApiResults(normalized);
      } catch {
        if (mounted) setApiResults(null);
      } finally {
        if (mounted) setSearching(false);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, [conversationId, searchQuery]);

  return (
    <SearchContainer>
      <SearchHeader>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 700 }}>
            {t("SEARCH.TITLE")}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <ClearIcon />
          </IconButton>
        </Box>
        <TextField
          fullWidth
          size="small"
          placeholder={t("SEARCH.PLACEHOLDER")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "#94A3B8", mr: 1 }} />,
            endAdornment: searchQuery ? (
              <IconButton size="small" onClick={() => setSearchQuery("")}>
                <ClearIcon fontSize="small" />
              </IconButton>
            ) : null,
          }}
        />
      </SearchHeader>

      <SearchContent>
        {searchQuery && (
          <Box sx={{ mb: 1.5 }}>
            <Chip label={t("SEARCH.RESULTS_LABEL", { count: finalResults.length })} size="small" color="primary" variant="outlined" />
          </Box>
        )}

        {searching ? (
          <Typography variant="body2" sx={{ textAlign: "center", py: 4 }}>
            {t("SEARCH.SEARCHING")}
          </Typography>
        ) : finalResults.length > 0 ? (
          finalResults.map((message) => (
            <ResultItem key={message.messageId} onClick={() => onMessageClick(message)}>
              <MessagePreview>
                {message.isDeleted ? t("CHAT.MESSAGE_DELETED") : message.body || t("SEARCH.NO_CONTENT")}
              </MessagePreview>
              <Typography variant="caption" color="#94A3B8">
                {new Date(message.createdAt).toLocaleString("vi-VN")}
              </Typography>
            </ResultItem>
          ))
        ) : searchQuery ? (
          <Typography variant="body2" sx={{ textAlign: "center", py: 4 }}>
            {t("SEARCH.NO_RESULTS")}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ textAlign: "center", py: 4, color: "#94A3B8" }}>
            {t("SEARCH.ENTER_KEYWORD")}
          </Typography>
        )}
      </SearchContent>
    </SearchContainer>
  );
};

export default SearchSidebar;
