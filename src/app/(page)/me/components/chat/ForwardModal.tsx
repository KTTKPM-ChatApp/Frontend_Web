"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Checkbox,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import { chatService } from "@/src/common/service/chat-service";
import type { UiMessage } from "@/src/common/interface/chat-interface";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface ForwardModalProps {
  visible: boolean;
  message: UiMessage | null;
  onClose: () => void;
  onForward: (message: UiMessage, conversationIds: string[], optionalMessage?: string) => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 12,
    maxWidth: 500,
    width: "100%",
  },
}));

const MessagePreview = styled(Box)(({ theme }) => ({
  backgroundColor: "#D8F0FA",
  borderRadius: 12,
  padding: 12,
  marginBottom: 16,
}));

export default function ForwardModal({
  visible,
  message,
  onClose,
  onForward,
}: ForwardModalProps) {
  const t = useTrans();
  const [searchQuery, setSearchQuery] = useState("");
  const [allConversations, setAllConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState<UiMessage | null>(null);
  const [selectedConversationIds, setSelectedConversationIds] = useState<Set<string>>(new Set());
  const [optionalMessage, setOptionalMessage] = useState("");

  // Store message locally when prop changes
  useEffect(() => {
    if (message) {
      setLocalMessage(message);
    }
  }, [message]);

  // Clear selections when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedConversationIds(new Set());
      setOptionalMessage("");
    }
  }, [visible]);

  // Fetch all conversations when modal opens
  useEffect(() => {
    if (visible) {
      loadConversations();
    }
  }, [visible]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await chatService.fetchListConversations({ limit: 50 });
      setAllConversations(response.payload?.data || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = allConversations.filter((chat) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleForward = async () => {
    const messageToForward = localMessage || message;
    if (!messageToForward || selectedConversationIds.size === 0) {
      return;
    }
    onForward(messageToForward, Array.from(selectedConversationIds), optionalMessage);
    onClose();
    setSearchQuery("");
    setLocalMessage(null);
    setOptionalMessage("");
  };

  const toggleSelection = (conversationId: string) => {
    setSelectedConversationIds((prev) => {
      const next = new Set(prev);
      if (next.has(conversationId)) {
        next.delete(conversationId);
      } else {
        if (next.size >= 20) {
          // Backend limit is 20 targets
          return prev;
        }
        next.add(conversationId);
      }
      return next;
    });
  };

  const getAvatarSource = (chat: any) => {
    if (chat.avatarUrl) {
      return chat.avatarUrl;
    }
    const name = chat.name || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=7F9CFB`;
  };

  return (
    <StyledDialog open={visible} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6" sx={{ flex: 1, textAlign: "center" }}>
          {t("FORWARD.TITLE")}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Search Bar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#F3F4F6", borderRadius: 1, px: 2, py: 1 }}>
          <SearchIcon sx={{ color: "#8e8e93" }} />
          <TextField
            placeholder={t("FORWARD.PLACEHOLDER")}
            variant="standard"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ disableUnderline: true }}
          />
        </Box>

        {/* Message Preview */}
        {localMessage && (
          <MessagePreview>
            <Typography variant="caption" color="#555555" sx={{ mb: 1 }}>
              Từ người dùng
            </Typography>
            <Typography variant="body2" color="#0068FF" sx={{ mb: 1 }}>
              {localMessage.body || ""}
            </Typography>
            {localMessage.attachments && localMessage.attachments.length > 0 && (
              <Typography variant="caption" color="#888888">
                {localMessage.attachments.length} tệp đính kèm
              </Typography>
            )}
          </MessagePreview>
        )}

        {/* Selected Contacts */}
        {selectedConversationIds.size > 0 && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {allConversations
              .filter((chat) => selectedConversationIds.has(chat.id))
              .map((chat) => (
                <Chip
                  key={chat.id}
                  avatar={<Avatar src={getAvatarSource(chat)} sx={{ width: 24, height: 24 }} />}
                  label={chat.name}
                  onDelete={() => toggleSelection(chat.id)}
                  sx={{ height: 32 }}
                />
              ))}
          </Box>
        )}

        {/* Contact List */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: 300, overflow: "auto" }}>
            {filteredChats.map((chat) => {
              const isSelected = selectedConversationIds.has(chat.id);
              return (
                <Box
                  key={chat.id}
                  onClick={() => toggleSelection(chat.id)}
                  sx={{ borderBottom: "1px solid #E5E7EB", cursor: "pointer" }}
                >
                  <ListItem sx={{ px: 2 }}>
                    <ListItemAvatar>
                      <Avatar src={getAvatarSource(chat)} />
                    </ListItemAvatar>
                    <ListItemText primary={chat.name} />
                    <Checkbox checked={isSelected} />
                  </ListItem>
                </Box>
              );
            })}
            {filteredChats.length === 0 && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography color="#8e8e93">{t("FORWARD.NO_RESULTS")}</Typography>
              </Box>
            )}
          </List>
        )}

        {/* Optional Message Input */}
        <TextField
          placeholder="Nhập kèm tin nhắn..."
          multiline
          rows={3}
          fullWidth
          value={optionalMessage}
          onChange={(e) => setOptionalMessage(e.target.value)}
          variant="outlined"
          sx={{ mt: 2 }}
        />

        {/* Footer */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 2 }}>
          <Typography variant="body2" color="#6B7280">
            Đã chọn: {selectedConversationIds.size}
          </Typography>
          <Button
            variant="contained"
            onClick={handleForward}
            disabled={selectedConversationIds.size === 0}
            sx={{
              bgcolor: selectedConversationIds.size > 0 ? "#0068FF" : "#E5E7EB",
              color: selectedConversationIds.size > 0 ? "#fff" : "#9CA3AF",
            }}
          >
            {t("FORWARD.SEND")}
          </Button>
        </Box>
      </DialogContent>
    </StyledDialog>
  );
}
