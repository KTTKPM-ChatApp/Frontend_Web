"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import { toast } from "react-toastify";

import { chatService } from "@/src/common/service/chat-service";
import { useChatStore } from "@/src/common/store/useChatStore";
import SectionBlock from "./SectionBlock";

interface ConversationActionsPanelProps {
  conversationId: string;
}

const Content = styled(Box)({
  display: "flex",
  flexDirection: "column",
});

const FormArea = styled(Box)({
  padding: "14px 16px 16px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
});

const InlineActions = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
});

const ActionButton = styled(Button)({
  height: 36,
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  textTransform: "none",
  boxShadow: "none",
  padding: "0 14px",
});

const PrimaryButton = styled(ActionButton)({
  background: "#0068FF",
  color: "#fff",
  "&:hover": {
    background: "#005AE0",
    boxShadow: "none",
  },
  "&:disabled": {
    background: "#E5E7EB",
    color: "#94A3B8",
  },
});

const OutlinedButton = styled(ActionButton)({
  background: "transparent",
  border: "1px solid #E5E7EB",
  color: "#000000",
  "&:hover": {
    background: "#F7F7F8",
    border: "1px solid #E5E7EB",
    boxShadow: "none",
  },
});

const StyledTextField = styled(TextField)({
  "& .MuiInputBase-root": {
    fontSize: 14,
    height: 40,
    borderRadius: 8,
  },
  "& .MuiInputBase-input": {
    padding: "10px 12px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#E5E7EB",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#0068FF",
  },
  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#0068FF",
    borderWidth: 1,
  },
  "& .MuiInputLabel-root": {
    fontSize: 13,
    color: "#767A7F",
  },
});

const HelperText = styled(Typography)({
  fontSize: 12,
  color: "#767A7F",
  lineHeight: 1.5,
});

const SwitchLabel = styled(Typography)({
  fontSize: 14,
  fontWeight: 500,
  color: "#000000",
});

const parseIds = (value: string) =>
  value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

export default function ConversationActionsPanel({
  conversationId,
}: ConversationActionsPanelProps) {
  const listConversation = useChatStore((s) => s.listConversation);
  const fetchListConversation = useChatStore((s) => s.fetchListConversation);
  const conversation = useMemo(
    () => listConversation.find((item) => item.id === conversationId),
    [conversationId, listConversation]
  );

  const [name, setName] = useState(conversation?.name ?? "");
  const [nickname, setNickname] = useState("");
  const [muted, setMuted] = useState(Boolean(conversation?.isMuted));
  const [inviteIds, setInviteIds] = useState("");
  const [inviteMessage, setInviteMessage] = useState("Mời bạn tham gia nhóm.");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState("Có\nKhông");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(conversation?.name ?? "");
    setMuted(Boolean(conversation?.isMuted));
    setNickname("");
  }, [conversation?.id, conversation?.name, conversation?.isMuted]);

  const refresh = () => fetchListConversation({ page: 1, limit: 20 });

  const handleSaveProfile = async () => {
    if (!conversationId) return;
    setSaving(true);
    try {
      const nameChanged = name.trim() && name.trim() !== conversation?.name;
      const mutedChanged = muted !== Boolean(conversation?.isMuted);

      if (nameChanged) {
        await chatService.updateConversation(conversationId, {
          name: name.trim(),
        });
      }

      if (mutedChanged || nickname.trim()) {
        await chatService.updateConversationSettings(conversationId, {
          nickname: nickname.trim() || undefined,
          isMuted: muted,
        });
      }

      if (nameChanged || mutedChanged || nickname.trim()) {
        await refresh();
        toast.success("Đã cập nhật hội thoại");
      }
    } catch (error) {
      toast.error("Không thể cập nhật hội thoại");
    } finally {
      setSaving(false);
    }
  };

  const handleSendInvites = async () => {
    const userIds = parseIds(inviteIds);
    if (userIds.length === 0) {
      toast.warning("Nhập ít nhất một user ID");
      return;
    }

    try {
      await chatService.sendInvites(conversationId, {
        userIds,
        message: inviteMessage.trim() || undefined,
        expiresInHours: 72,
      });
      setInviteIds("");
      toast.success("Đã gửi lời mời");
    } catch (error) {
      toast.error("Không thể gửi lời mời");
    }
  };

  const handleCreatePoll = async () => {
    const options = parseIds(pollOptions);
    if (!pollQuestion.trim() || options.length < 2) {
      toast.warning("Cần câu hỏi và ít nhất 2 lựa chọn");
      return;
    }

    try {
      await chatService.createPoll(conversationId, {
        question: pollQuestion.trim(),
        options,
        allow_multiple: false,
        allow_add_option: true,
        is_anonymous: false,
        expires_in_hours: 24,
      });
      setPollQuestion("");
      setPollOptions("Có\nKhông");
      toast.success("Đã tạo bình chọn");
    } catch (error) {
      toast.error("Không thể tạo bình chọn");
    }
  };

  return (
    <SectionBlock title="Quản lý hội thoại" defaultOpen>
      <Content>
        <FormArea>
          <StyledTextField
            label="Tên hội thoại"
            size="small"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
          />
          <StyledTextField
            label="Biệt danh của bạn"
            size="small"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            fullWidth
          />
          <InlineActions>
            <FormControlLabel
              control={
                <Switch
                  checked={muted}
                  onChange={(_, checked) => setMuted(checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#0068FF",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#0068FF",
                    },
                  }}
                />
              }
              label={<SwitchLabel>Tắt thông báo</SwitchLabel>}
            />
            <PrimaryButton
              variant="contained"
              startIcon={<SaveOutlinedIcon sx={{ fontSize: 18 }} />}
              onClick={handleSaveProfile}
              disabled={saving}
            >
              Lưu
            </PrimaryButton>
          </InlineActions>
        </FormArea>

        <Divider />

        <FormArea>
          <HelperText>Nhập user ID, cách nhau bằng dấu phẩy hoặc xuống dòng.</HelperText>
          <StyledTextField
            label="User ID cần mời"
            size="small"
            multiline
            minRows={2}
            value={inviteIds}
            onChange={(event) => setInviteIds(event.target.value)}
            fullWidth
          />
          <StyledTextField
            label="Lời nhắn"
            size="small"
            value={inviteMessage}
            onChange={(event) => setInviteMessage(event.target.value)}
            fullWidth
          />
          <OutlinedButton
            variant="outlined"
            startIcon={<PersonAddAltOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={handleSendInvites}
          >
            Gửi lời mời
          </OutlinedButton>
        </FormArea>

        <Divider />

        <FormArea>
          <StyledTextField
            label="Câu hỏi bình chọn"
            size="small"
            value={pollQuestion}
            onChange={(event) => setPollQuestion(event.target.value)}
            fullWidth
          />
          <StyledTextField
            label="Lựa chọn"
            size="small"
            multiline
            minRows={3}
            value={pollOptions}
            onChange={(event) => setPollOptions(event.target.value)}
            fullWidth
          />
          <OutlinedButton
            variant="outlined"
            startIcon={<PollOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={handleCreatePoll}
          >
            Tạo bình chọn
          </OutlinedButton>
        </FormArea>

      </Content>
    </SectionBlock>
  );
}