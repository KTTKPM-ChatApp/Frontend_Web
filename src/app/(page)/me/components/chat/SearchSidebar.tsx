"use client";

import { useState, useEffect } from "react";
import { Box, Typography, TextField, IconButton, Chip, Menu, MenuItem, Stack, Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { chatService } from "@/src/common/service/chat-service";
import { UiMessage } from "@/src/common/interface/chat-interface";
import { useChatStore } from "@/src/common/store/useChatStore";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface SearchSidebarProps {
  conversationId: string;
  onClose: () => void;
  onMessageClick?: (message: UiMessage) => void;
}

const Root = styled(Box)(({ theme }) => ({
  width: 360,
  minWidth: 360,
  height: "100%",
  background: theme.palette.background.paper,
  borderLeft: `1px solid ${theme.palette.divider}`,
  display: "flex",
  flexDirection: "column",
}));

const Header = styled(Box)(({ theme }) => ({
  height: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 16px",
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
  fontSize: 16,
  fontWeight: 700,
  color: theme.palette.text.primary,
}));

const Content = styled(Box)({
  flex: 1,
  overflowY: "auto",
  padding: "12px",
});

const SearchInput = styled(TextField)(({ theme }) => ({
  width: "100%",
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.background.default,
    borderRadius: 8,
    "& fieldset": {
      borderColor: theme.palette.divider,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.text.secondary,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
  "& .MuiInputBase-input": {
    color: theme.palette.text.primary,
    padding: "12px 12px 12px 44px",
  },
  "& .MuiInputBase-input::placeholder": {
    color: theme.palette.text.secondary,
  },
}));

const SearchIconWrapper = styled(Box)(({ theme }) => ({
  position: "absolute",
  left: 12,
  top: "50%",
  transform: "translateY(-50%)",
  color: theme.palette.text.secondary,
  pointerEvents: "none",
}));

const FilterBar = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 12,
  marginBottom: 16,
});

const FilterLabel = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  height: 28,
  fontSize: 13,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "& .MuiChip-label": {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
}));

const EmptyState = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: "32px",
  textAlign: "center",
});

const EmptyIcon = styled(Box)(({ theme }) => ({
  fontSize: 64,
  color: theme.palette.text.disabled,
  marginBottom: 16,
}));

const EmptyText = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.secondary,
  lineHeight: 1.5,
}));

const ResultItem = styled(Box)(({ theme }) => ({
  padding: "12px",
  borderRadius: 8,
  marginBottom: 8,
  cursor: "pointer",
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ResultAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  flexShrink: 0,
}));

const ResultContentWrapper = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const ResultSender = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  fontWeight: 600,
  color: theme.palette.primary.main,
  marginBottom: 4,
}));

const ResultContent = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.primary,
  marginBottom: 4,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  lineHeight: 1.4,
}));

const HighlightText = styled("span")(({ theme }) => ({
  backgroundColor: theme.palette.primary.main + "20",
  color: theme.palette.primary.main,
  fontWeight: 600,
  padding: "0 2px",
  borderRadius: 2,
}));

const ResultTime = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: theme.palette.text.secondary,
}));

const ResultCount = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  color: theme.palette.text.secondary,
  marginBottom: 12,
  fontStyle: "italic",
}));

export default function SearchSidebar({ conversationId, onClose, onMessageClick }: SearchSidebarProps) {
  const t = useTrans();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UiMessage[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [senderFilter, setSenderFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [senderMenuAnchor, setSenderMenuAnchor] = useState<null | HTMLElement>(null);
  const [dateMenuAnchor, setDateMenuAnchor] = useState<null | HTMLElement>(null);

  const conversationDetail = useChatStore((s) => s.conversationDetailById?.[conversationId]);
  const members = conversationDetail?.members ?? [];

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
        setTotalResults(0);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery, senderFilter, dateFilter]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const params: any = { q: searchQuery.trim() };
      if (senderFilter) params.senderId = senderFilter;
      if (dateFilter) {
        const now = Date.now();
        if (dateFilter === "today") {
          params.from = new Date().setHours(0, 0, 0, 0);
          params.to = now;
        } else if (dateFilter === "week") {
          params.from = now - 7 * 24 * 60 * 60 * 1000;
          params.to = now;
        } else if (dateFilter === "month") {
          params.from = now - 30 * 24 * 60 * 60 * 1000;
          params.to = now;
        }
      }

      const response = await chatService.searchMessages(conversationId, params);

      if (response?.payload?.data) {
        setSearchResults(response.payload.data.items || []);
        setTotalResults(response.payload.data.total || 0);
      }
    } catch (error) {
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSenderFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setSenderMenuAnchor(event.currentTarget);
  };

  const handleDateFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setDateMenuAnchor(event.currentTarget);
  };

  const handleSenderFilterClose = () => {
    setSenderMenuAnchor(null);
  };

  const handleDateFilterClose = () => {
    setDateMenuAnchor(null);
  };

  const handleSenderSelect = (memberId: string) => {
    setSenderFilter(memberId === senderFilter ? null : memberId);
    handleSenderFilterClose();
  };

  const handleDateSelect = (dateOption: string) => {
    setDateFilter(dateOption === dateFilter ? null : dateOption);
    handleDateFilterClose();
  };

  const handleResultClick = (message: UiMessage) => {
    if (onMessageClick) {
      onMessageClick(message);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getSenderName = (senderId: string) => {
    const member = members.find((m) => m.userId === senderId);
    return member?.nickname || member?.fullName || t("CHAT.USER");
  };

  const getSenderAvatar = (senderId: string): string | undefined => {
    const member = members.find((m) => m.userId === senderId);
    return member?.avatarUrl || undefined;
  };

  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword || !text) return text;
    
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === keyword.toLowerCase()) {
        return <HighlightText key={index}>{part}</HighlightText>;
      }
      return part;
    });
  };

  return (
    <Root>
      <Header>
        <HeaderTitle>{t("SEARCH.TITLE")}</HeaderTitle>
        <IconButton onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </Header>

      <Content>
        <Box sx={{ position: "relative", mb: 2 }}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <SearchInput
            placeholder={t("SEARCH.PLACEHOLDER")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            size="small"
          />
        </Box>

        <FilterBar>
          <FilterLabel>{t("SEARCH.FILTER_BY")}</FilterLabel>
          <FilterChip
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                {t("SEARCH.FILTER_SENDER")}
                <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
              </Box>
            }
            onClick={handleSenderFilterClick}
            sx={senderFilter ? { backgroundColor: "primary.main", borderColor: "primary.main", color: "primary.contrastText" } : {}}
          />
          <FilterChip
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                {t("SEARCH.FILTER_DATE")}
                <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
              </Box>
            }
            onClick={handleDateFilterClick}
            sx={dateFilter ? { backgroundColor: "primary.main", borderColor: "primary.main", color: "primary.contrastText" } : {}}
          />
        </FilterBar>

        <Menu
          anchorEl={senderMenuAnchor}
          open={Boolean(senderMenuAnchor)}
          onClose={handleSenderFilterClose}
          PaperProps={{
            sx: {
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              maxHeight: 300,
              minWidth: 200,
            },
          }}
        >
          <MenuItem
            onClick={() => handleSenderSelect("")}
            sx={{ color: "text.primary", "&:hover": { backgroundColor: "action.hover" } }}
          >
            {t("SEARCH.ALL")}
          </MenuItem>
          {members.map((member) => (
            <MenuItem
              key={member.userId}
              onClick={() => handleSenderSelect(member.userId)}
              sx={{ color: "text.primary", "&:hover": { backgroundColor: "action.hover" } }}
              selected={senderFilter === member.userId}
            >
              {member.nickname || member.fullName}
            </MenuItem>
          ))}
        </Menu>

        <Menu
          anchorEl={dateMenuAnchor}
          open={Boolean(dateMenuAnchor)}
          onClose={handleDateFilterClose}
          PaperProps={{
            sx: {
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              minWidth: 150,
            },
          }}
        >
          <MenuItem
            onClick={() => handleDateSelect("")}
            sx={{ color: "text.primary", "&:hover": { backgroundColor: "action.hover" } }}
          >
            {t("SEARCH.ALL")}
          </MenuItem>
          <MenuItem
            onClick={() => handleDateSelect("today")}
            sx={{ color: "text.primary", "&:hover": { backgroundColor: "action.hover" } }}
            selected={dateFilter === "today"}
          >
            {t("SEARCH.TODAY")}
          </MenuItem>
          <MenuItem
            onClick={() => handleDateSelect("week")}
            sx={{ color: "text.primary", "&:hover": { backgroundColor: "action.hover" } }}
            selected={dateFilter === "week"}
          >
            {t("SEARCH.LAST_7_DAYS")}
          </MenuItem>
          <MenuItem
            onClick={() => handleDateSelect("month")}
            sx={{ color: "text.primary", "&:hover": { backgroundColor: "action.hover" } }}
            selected={dateFilter === "month"}
          >
            {t("SEARCH.LAST_30_DAYS")}
          </MenuItem>
        </Menu>

        {!searchQuery.trim() && !loading ? (
          <EmptyState>
            <EmptyIcon>🔍</EmptyIcon>
            <EmptyText>
              {t("SEARCH.EMPTY_HINT")}
            </EmptyText>
          </EmptyState>
        ) : loading ? (
          <EmptyState>
            <EmptyText>{t("SEARCH.LOADING")}</EmptyText>
          </EmptyState>
        ) : searchResults.length === 0 ? (
          <EmptyState>
            <EmptyText>{t("SEARCH.NO_RESULTS")}</EmptyText>
          </EmptyState>
        ) : (
          <Box>
            <ResultCount>{t("SEARCH.RESULTS_COUNT").replace("{count}", String(totalResults))}</ResultCount>
            {searchResults.map((message) => (
              <ResultItem key={message.messageId} onClick={() => handleResultClick(message)}>
                <ResultAvatar src={getSenderAvatar(message.senderId)} alt={getSenderName(message.senderId)}>
                  {getSenderName(message.senderId).charAt(0).toUpperCase()}
                </ResultAvatar>
                <ResultContentWrapper>
                  <ResultSender>{getSenderName(message.senderId)}</ResultSender>
                  <ResultContent>
                    {message.body ? highlightKeyword(message.body, searchQuery) : t("CHAT.FILE_ATTACHMENT_ALT")}
                  </ResultContent>
                  <ResultTime>{formatTime(message.createdAt)}</ResultTime>
                </ResultContentWrapper>
              </ResultItem>
            ))}
          </Box>
        )}
      </Content>
    </Root>
  );
}
