"use client";

import { useChatStore } from "@/src/common/store/useChatStore";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

interface ChatHeaderProps {
  title?: string;
  socketConnected: boolean;
  error?: string | null;
  conversationId: string | null
}

const HeaderRoot = styled(Box)({
  width: "100%",
  background: "#fff",
  minHeight:70,
  display:"flex",
  flexDirection:"column",
  justifyContent:"center",
  paddingLeft:"16px"
});

const HeaderTop = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height:"100%",
  width:"100%"
});

const HeaderLeft = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

const HeaderTitle = styled(Typography)({
  fontSize: 18,
  fontWeight: 600,
  color: "#111827",
  lineHeight: 1.2,
});

const HeaderSubtitle = styled(Typography)({
  fontSize: 13,
  color: "#6B7280",
  lineHeight: 1.2,
  display: "flex",
  alignItems: "center",
});

const StatusDot = styled("span")<{ online?: boolean }>(({ online }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: online ? "#22C55E" : "#C7CDD6",
  display: "inline-block",
  marginRight: 8,
}));

export default function ChatHeader({
  socketConnected,
  conversationId
}: ChatHeaderProps) {
  const listConversation = useChatStore((s) => s.listConversation)
  return (
    <HeaderRoot>
      <HeaderTop>
        <HeaderLeft>
          <HeaderTitle>{listConversation.find((n)=> n.id === conversationId)?.name}</HeaderTitle>
          <HeaderSubtitle>
            <StatusDot online={socketConnected} />
            {socketConnected ? "Đã kết nối" : "Mất kết nối"}
          </HeaderSubtitle>
        </HeaderLeft>
      </HeaderTop>

      {/* {error && (
        <ErrorBar>
          <ErrorText>{error}</ErrorText>
        </ErrorBar>
      )} */}
    </HeaderRoot>
  );
}