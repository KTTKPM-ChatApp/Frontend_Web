"use client";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useChatStore } from "@/src/common/store/useChatStore";

const Card = styled(Box)({
  background: "#fff",
  marginBottom: 8,
  borderRadius: 8,
});

const SimpleRow = styled(Box)({
  minHeight: 56,
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  gap: 12,
});

const IconWrapper = styled(Box)({
  width: 40,
  height: 40,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

const SimpleText = styled(Typography)({
  fontSize: 14,
  fontWeight: 500,
  color: "#000000",
  lineHeight: 1.4,
});

const SubText = styled(Typography)({
  fontSize: 13,
  color: "#767A7F",
  marginTop: 2,
  lineHeight: 1.4,
});

export default function OverviewCard() {
  const listConversation = useChatStore((s) => s.listConversation);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const currentConversation = listConversation.find(
    (item) => item.id === activeConversationId
  );

  const isGroup = currentConversation?.type === "group" || currentConversation?.type === "GROUP";
  const actualMembers = currentConversation?.members ?? [];
  const memberCount = actualMembers.length > 0 ? actualMembers.length : (currentConversation?.memberCount ?? 0);

  const ownerCount = currentConversation?.members?.filter((m: any) => m.role === "OWNER").length ?? 0;
  const adminCount = currentConversation?.members?.filter((m: any) => m.role === "ADMIN").length ?? 0;

  return (
    <Card>
      <SimpleRow>
        <IconWrapper sx={{ 
          background: isGroup ? "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)" : "#F7F7F8" 
        }}>
          {isGroup ? (
            <Groups2OutlinedIcon sx={{ fontSize: 22, color: "#0068FF" }} />
          ) : (
            <PersonOutlinedIcon sx={{ fontSize: 22, color: "#767A7F" }} />
          )}
        </IconWrapper>
        <Box>
          <SimpleText>
            {isGroup ? `${memberCount} thành viên` : "Hội thoại cá nhân"}
          </SimpleText>
          {isGroup && (ownerCount > 0 || adminCount > 0) && (
            <SubText>
              {ownerCount > 0 && `${ownerCount} chủ nhóm`}
              {ownerCount > 0 && adminCount > 0 && ", "}
              {adminCount > 0 && `${adminCount} quản trị viên`}
            </SubText>
          )}
        </Box>
      </SimpleRow>
    </Card>
  );
}