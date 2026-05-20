"use client";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useChatStore } from "@/src/common/store/useChatStore";

const Card = styled(Box)({
  background: "#fff",
  marginBottom: 8,
});

const SimpleRow = styled(Box)({
  minHeight: 56,
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  gap: 12,
});

const SimpleText = styled(Typography)({
  fontSize: 15,
  color: "#0F172A",
});

const SubText = styled(Typography)({
  fontSize: 13,
  color: "#64748B",
  marginTop: 1,
});

export default function OverviewCard() {
  const listConversation = useChatStore((s) => s.listConversation);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const currentConversation = listConversation.find(
    (item) => item.id === activeConversationId
  );

  const isGroup = currentConversation?.type === "group" || currentConversation?.type === "GROUP";
  const memberCount = currentConversation?.memberCount ?? 0;

  return (
    <Card>
      <SimpleRow>
        <Box>
          <SimpleText>
            {isGroup ? `${memberCount} thành viên` : "Hội thoại cá nhân"}
          </SimpleText>
          {isGroup && (
            <SubText>
              {currentConversation?.members?.length
                ? `${currentConversation.members.filter((m: any) => m.role === "OWNER").length} chủ nhóm, ${currentConversation.members.filter((m: any) => m.role === "ADMIN").length} quản trị viên`
                : ""}
            </SubText>
          )}
        </Box>
      </SimpleRow>
    </Card>
  );
}
