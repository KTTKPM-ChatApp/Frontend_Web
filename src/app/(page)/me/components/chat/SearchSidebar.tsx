"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const SearchContainer = styled(Box)(({ theme }) => ({
  width: 300,
  height: "100%",
  borderLeft: "1px solid #E5E7EB",
  backgroundColor: "#FFFFFF",
  display: "flex",
  flexDirection: "column",
}));

const SearchHeader = styled(Box)(({ theme }) => ({
  padding: "16px",
  borderBottom: "1px solid #E5E7EB",
}));

const SearchContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: "16px",
}));

const ResultItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 8,
  marginBottom: 8,
  border: "1px solid #F1F5F9",
  "&:hover": {
    backgroundColor: "#F8FAFC",
  },
}));

const MessagePreview = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: "#64748B",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

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

const SearchSidebar: React.FC<SearchSidebarProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock search results
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      // Simulate search delay
      const timer = setTimeout(() => {
        setSearchResults([
          {
            messageId: "1",
            body: `Tin nhắn chứa "${searchQuery}" - đây là kết quả tìm kiếm`,
            createdAt: "2024-01-01T10:00:00Z",
            senderId: "user1",
          },
          {
            messageId: "2",
            body: `Một tin nhắn khác với từ khóa "${searchQuery}"`,
            createdAt: "2024-01-01T11:00:00Z",
            senderId: "user2",
          },
        ]);
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <SearchContainer>
      <SearchHeader>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
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
            endAdornment: searchQuery && (
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon fontSize="small" />
              </IconButton>
            ),
          }}
        />
      </SearchHeader>

      <SearchContent>
        {searchQuery && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={t("SEARCH.RESULTS_COUNT", { count: searchResults.length })}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        )}

        {isSearching ? (
          <Typography variant="body2" sx={{ textAlign: "center", py: 4 }}>
            {t("SEARCH.SEARCHING")}
          </Typography>
        ) : searchResults.length > 0 ? (
          <List>
            {searchResults.map((message) => (
              <ResultItem
                key={message.messageId}
                onClick={() => onMessageClick(message)}
                button
              >
                <ListItemText
                  primary={
                    <MessagePreview>
                      {message.body}
                    </MessagePreview>
                  }
                  secondary={
                    <Typography variant="caption" color="#94A3B8">
                      {new Date(message.createdAt).toLocaleString("vi-VN")}
                    </Typography>
                  }
                />
              </ResultItem>
            ))}
          </List>
        ) : searchQuery ? (
          <Typography variant="body2" sx={{ textAlign: "center", py: 4, color: "#64748B" }}>
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
