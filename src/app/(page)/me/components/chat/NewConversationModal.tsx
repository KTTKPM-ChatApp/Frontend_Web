"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  IconButton,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";

import { userService } from "@/src/common/service/user-service";
import { chatService } from "@/src/common/service/chat-service";
import { useChatStore } from "@/src/common/store/useChatStore";
import { openConversation } from "@/src/common/action/chat.action";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    width: 420,
    maxWidth: "90vw",
    maxHeight: "80vh",
  },
});

const SearchField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
});

const UserItem = styled(ListItem)({
  borderRadius: 8,
  marginBottom: 4,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#F3F4F6",
  },
});

const StatusChip = styled(Chip)<{ isonline?: number }>(({ isonline }) => ({
  height: 20,
  fontSize: 11,
  backgroundColor: isonline ? "#DCFCE7" : "#F3F4F6",
  color: isonline ? "#166534" : "#6B7280",
  "& .MuiChip-label": {
    padding: "0 8px",
  },
}));

interface UserSearchResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  friendshipStatus?: "friend" | "outgoing" | "incoming" | "none";
}

interface NewConversationModalProps {
  open: boolean;
  onClose: () => void;
}

const DEBOUNCE_DELAY = 300;

const NewConversationModal: React.FC<NewConversationModalProps> = ({
  open,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const fetchListConversation = useChatStore((s) => s.fetchListConversation);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await userService.searchUsers(query, 20, 0);
      const users = (response.payload as any)?.data || [];
      setSearchResults(users);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim()) {
      debounceRef.current = setTimeout(() => {
        handleSearch(searchQuery);
      }, DEBOUNCE_DELAY);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, handleSearch]);

  const handleUserClick = async (user: UserSearchResult) => {
    setCreating(true);
    try {
      const response = await chatService.createDirectConversation({ participantId: user.id });
      const conversation = (response.payload as any)?.data;
      
      if (conversation?.id) {
        await openConversation(conversation.id);
        await fetchListConversation();
        onClose();
        setSearchQuery("");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Create conversation error:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  const getFriendshipLabel = (status?: string) => {
    switch (status) {
      case "friend":
        return "Bạn bè";
      case "outgoing":
        return "Đã gửi lời mời";
      case "incoming":
        return "Chờ xác nhận";
      default:
        return null;
    }
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600}>
            Tạo cuộc trò chuyện mới
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        <SearchField
          fullWidth
          placeholder="Tìm kiếm theo tên, số điện thoại hoặc username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#9CA3AF" }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery("")}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        <Box mt={2} minHeight={300} maxHeight={400} overflow="auto">
          {loading && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!loading && searchQuery && searchResults.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                Không tìm thấy người dùng nào
              </Typography>
            </Box>
          )}

          {!loading && searchResults.length > 0 && (
            <List dense>
              {searchResults.map((user) => (
                <UserItem
                  key={user.id}
                  onClick={() => !creating && handleUserClick(user)}
                >
                  <ListItemAvatar>
                    <Avatar src={user.avatarUrl || undefined}>
                      {user.displayName?.[0] || user.username?.[0] || "?"}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={500}>
                          {user.displayName || user.username}
                        </Typography>
                        {user.friendshipStatus === "friend" && (
                          <StatusChip
                            label="Bạn bè"
                            size="small"
                            isonline={1}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        @{user.username}
                        {user.phoneNumber && ` • ${user.phoneNumber}`}
                      </Typography>
                    }
                  />
                  {creating && (
                    <CircularProgress size={20} />
                  )}
                </UserItem>
              ))}
            </List>
          )}

          {!searchQuery && (
            <Box textAlign="center" py={4} color="text.secondary">
              <PersonIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
              <Typography>
                Nhập tên, số điện thoại hoặc username để tìm kiếm
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export default NewConversationModal;