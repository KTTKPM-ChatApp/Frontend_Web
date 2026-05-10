"use client";

import { Box, Divider, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import { useChatStore } from "@/src/common/store/useChatStore";

const Card = styled(Box)({
    background: "#fff",
    marginBottom: 8,
});

const SimpleRow = styled(Box)({
    minHeight: 62,
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    gap: 12,
});

const SimpleText = styled(Typography)({
    fontSize: 15,
    color: "#0F172A",
});

export default function OverviewCard() {
    const listConversation = useChatStore((s) => s.listConversation)
    const activeConversationId = useChatStore((s) => s.activeConversationId)
    const currentConversation = listConversation.find((cvs) => cvs.id === activeConversationId)
    return (
        <Card>
            <SimpleRow>
                <AccessTimeRoundedIcon  />
                <SimpleText>Danh sách nhắc hẹn</SimpleText>
            </SimpleRow>

            <Divider />

            <SimpleRow>
                <Groups2OutlinedIcon/>
                <SimpleText>{currentConversation?.memberCount} nhóm chung</SimpleText>
            </SimpleRow>
        </Card>
    );
}