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
import SettingsPhoneOutlinedIcon from "@mui/icons-material/SettingsPhoneOutlined";
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
  borderRadius: 8,
  textTransform: "none",
  fontWeight: 700,
});

const HelperText = styled(Typography)({
  fontSize: 12,
  color: "#64748B",
  lineHeight: 1.45,
});

const ResultBox = styled(Box)({
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  background: "#F8FAFC",
  padding: 10,
  maxHeight: 130,
  overflow: "auto",
  fontFamily: "monospace",
  fontSize: 12,
  color: "#334155",
  whiteSpace: "pre-wrap",
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
  const [callResult, setCallResult] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(conversation?.name ?? "");
    setMuted(Boolean(conversation?.isMuted));
    setNickname("");
    setCallResult("");
  }, [conversation?.id, conversation?.name, conversation?.isMuted]);

  const refresh = () => fetchListConversation({ page: 1, limit: 20 });

  const handleSaveProfile = async () => {
    if (!conversationId) return;
    setSaving(true);
    try {
      if (name.trim() && name.trim() !== conversation?.name) {
        await chatService.updateConversation(conversationId, {
          name: name.trim(),
        });
      }

      await chatService.updateConversationSettings(conversationId, {
        nickname: nickname.trim() || undefined,
        isMuted: muted,
      });

      await refresh();
      toast.success("Đã cập nhật hội thoại");
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

  const handleCallDiagnostics = async () => {
    try {
      const [ice, state] = await Promise.all([
        chatService.getIceServers(),
        chatService.getCallState(conversationId),
      ]);
      setCallResult(
        JSON.stringify(
          {
            iceServers: ice.payload,
            callState: state.payload,
          },
          null,
          2
        )
      );
    } catch (error) {
      toast.error("Không thể tải trạng thái cuộc gọi");
    }
  };

  return (
    <SectionBlock title="Quản lý hội thoại" defaultOpen>
      <Content>
        <FormArea>
          <TextField
            label="Tên hội thoại"
            size="small"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextField
            label="Biệt danh của bạn"
            size="small"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
          <InlineActions>
            <FormControlLabel
              control={
                <Switch
                  checked={muted}
                  onChange={(_, checked) => setMuted(checked)}
                />
              }
              label="Tắt thông báo"
            />
            <ActionButton
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              onClick={handleSaveProfile}
              disabled={saving}
            >
              Lưu
            </ActionButton>
          </InlineActions>
        </FormArea>

        <Divider />

        <FormArea>
          <HelperText>Nhập user ID, cách nhau bằng dấu phẩy hoặc xuống dòng.</HelperText>
          <TextField
            label="User ID cần mời"
            size="small"
            multiline
            minRows={2}
            value={inviteIds}
            onChange={(event) => setInviteIds(event.target.value)}
          />
          <TextField
            label="Lời nhắn"
            size="small"
            value={inviteMessage}
            onChange={(event) => setInviteMessage(event.target.value)}
          />
          <ActionButton
            variant="outlined"
            startIcon={<PersonAddAltOutlinedIcon />}
            onClick={handleSendInvites}
          >
            Gửi lời mời
          </ActionButton>
        </FormArea>

        <Divider />

        <FormArea>
          <TextField
            label="Câu hỏi bình chọn"
            size="small"
            value={pollQuestion}
            onChange={(event) => setPollQuestion(event.target.value)}
          />
          <TextField
            label="Lựa chọn"
            size="small"
            multiline
            minRows={3}
            value={pollOptions}
            onChange={(event) => setPollOptions(event.target.value)}
          />
          <ActionButton
            variant="outlined"
            startIcon={<PollOutlinedIcon />}
            onClick={handleCreatePoll}
          >
            Tạo bình chọn
          </ActionButton>
        </FormArea>

        <Divider />

        <FormArea>
          <ActionButton
            variant="outlined"
            startIcon={<SettingsPhoneOutlinedIcon />}
            onClick={handleCallDiagnostics}
          >
            Kiểm tra call API
          </ActionButton>
          {callResult && <ResultBox>{callResult}</ResultBox>}
        </FormArea>
      </Content>
    </SectionBlock>
  );
}
