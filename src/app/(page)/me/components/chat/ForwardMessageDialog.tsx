"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useChatStore } from "@/src/common/store/useChatStore";
import { chatService } from "@/src/common/service/chat-service";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    width: 420,
    maxHeight: 520,
    borderRadius: 12,
  },
});

const SearchField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    fontSize: 14,
  },
});

interface ForwardMessageDialogProps {
  open: boolean;
  onClose: () => void;
  messageId: string;
  conversationId: string;
}

export default function ForwardMessageDialog({
  open,
  onClose,
  messageId,
  conversationId,
}: ForwardMessageDialogProps) {
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const listConversation = useChatStore((s) => s.listConversation);

  const filtered = listConversation.filter(
    (c) =>
      c.id !== conversationId &&
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleForward = async () => {
    if (selectedIds.length === 0) return;
    setSending(true);
    try {
      await chatService.forwardMessage({
        forward_id: crypto.randomUUID(),
        source_message_id: messageId,
        targets: selectedIds.map((cid) => ({
          message_id: crypto.randomUUID(),
          conversation_id: cid,
        })),
      });
      onClose();
    } catch (err) {
      console.error("Forward error:", err);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedIds([]);
    }
  }, [open]);

  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontSize: 16, fontWeight: 700, pb: 1 }}>
        Chuyển tiếp tin nhắn
      </DialogTitle>

      <DialogContent sx={{ px: 2, py: 1 }}>
        <SearchField
          fullWidth
          size="small"
          placeholder="Tìm kiếm hội thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Không tìm thấy hội thoại
            </Typography>
          </Box>
        ) : (
          <List sx={{ mt: 1, maxHeight: 300, overflow: "auto" }}>
            {filtered.map((c) => (
              <ListItemButton
                key={c.id}
                selected={selectedIds.includes(c.id)}
                onClick={() => handleToggle(c.id)}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemAvatar>
                  <Avatar src={c.avatarUrl ?? undefined}>
                    {c.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={c.name}
                  secondary={
                    c.type === "group"
                      ? `${c.memberCount ?? 0} thành viên`
                      : "Tin nhắn trực tiếp"
                  }
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: 12 }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose} size="small" sx={{ textTransform: "none" }}>
          Hủy
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={selectedIds.length === 0 || sending}
          onClick={handleForward}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {sending ? (
            <CircularProgress size={16} sx={{ color: "#fff" }} />
          ) : (
            `Chuyển tiếp (${selectedIds.length})`
          )}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
