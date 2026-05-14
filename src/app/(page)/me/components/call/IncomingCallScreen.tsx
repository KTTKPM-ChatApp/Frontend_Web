"use client";

import { Box, Typography, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import CallEndIcon from "@mui/icons-material/CallEnd";
import CallIcon from "@mui/icons-material/Call";
import { useCallStore } from "@/src/common/store/useCallStore";
import { useChatStore } from "@/src/common/store/useChatStore";
import { acceptCall, rejectCall } from "@/src/common/service/call-service";
import AppAvatar, { buildS3Url } from "@/src/shared/component/Avatar";
import { useTrans } from "@/src/common/utilities/hook/trans";
import { getcurrentUserId } from "@/src/common/utilities/utils";
import type { ConversationDto } from "@/src/common/interface/chat-interface";

const Container = styled(Box)({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
});

const AvatarWrapper = styled(Box)({
  marginBottom: 24,
  animation: "pulse 2s infinite",
  "@keyframes pulse": {
    "0%": { transform: "scale(1)", opacity: 1 },
    "50%": { transform: "scale(1.05)", opacity: 0.8 },
    "100%": { transform: "scale(1)", opacity: 1 },
  },
});

const Name = styled(Typography)({
  fontSize: 24,
  fontWeight: 600,
  color: "#fff",
  marginBottom: 8,
});

const Subtitle = styled(Typography)({
  fontSize: 16,
  color: "rgba(255,255,255,0.7)",
  marginBottom: 48,
});

const Actions = styled(Box)({
  display: "flex",
  gap: 48,
  alignItems: "center",
});

const DeclineButton = styled(Button)({
  width: 72,
  height: 72,
  borderRadius: "50%",
  background: "#ef4444",
  minWidth: "unset",
  "&:hover": { background: "#dc2626" },
});

const AcceptButton = styled(Button)({
  width: 72,
  height: 72,
  borderRadius: "50%",
  background: "#22c55e",
  minWidth: "unset",
  "&:hover": { background: "#16a34a" },
});

// Helper function to get user display name
function getUserDisplayName(userId: string, members: ConversationDto["members"]): string {
  const member = members?.find((m) => m.userId === userId);
  return member?.nickname || member?.fullName || userId.slice(0, 8);
}

// Helper function to get conversation display name
function getConversationDisplayName(conversation: ConversationDto | null, members: ConversationDto["members"], currentUserId: string): string {
  if (!conversation) return "";
  
  const isGroup = conversation.type === "group";
  if (isGroup) {
    return conversation.name ?? "";
  }
  
  const otherMember = members?.find((m) => m.userId !== currentUserId);
  return otherMember?.nickname || otherMember?.fullName || conversation.name || "";
}

export default function IncomingCallScreen() {
  const t = useTrans();
  const activeCall = useCallStore((s) => s.activeCall);
  
  // Get conversation and user data
  const listConversation = useChatStore((s) => s.listConversation);
  const conversationDetail = useChatStore(
    (s) => s.conversationDetailById?.[activeCall?.conversation_id || ""] ?? null
  );
  const currentUserId = getcurrentUserId() || "";
  
  const currentConversation =
    conversationDetail ?? listConversation.find((n) => n.id === activeCall?.conversation_id);
  const members = currentConversation?.members ?? [];

  const initiatorId = activeCall?.initiator_id;
  const isVideo = activeCall?.call_type === "video";
  
  // Get display name for the caller
  const callerName = initiatorId 
    ? getUserDisplayName(initiatorId, members)
    : getConversationDisplayName(currentConversation, members, currentUserId) || t("CHAT.USER");

  return (
    <Container>
      <AvatarWrapper>
        <AppAvatar
          name={callerName}
          size={120}
          fontSize={48}
        />
      </AvatarWrapper>

      <Name>
        {callerName}
      </Name>

      <Subtitle>
        {isVideo ? t("CALL.VIDEO_INCOMING") : t("CALL.AUDIO_INCOMING")}
      </Subtitle>

      <Actions>
        <DeclineButton onClick={() => rejectCall()}>
          <CallEndIcon sx={{ color: "#fff", fontSize: 36 }} />
        </DeclineButton>

        <AcceptButton onClick={acceptCall}>
          <CallIcon sx={{ color: "#fff", fontSize: 36 }} />
        </AcceptButton>
      </Actions>
    </Container>
  );
}
