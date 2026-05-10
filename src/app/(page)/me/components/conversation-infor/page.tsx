"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { useChatStore } from "@/src/common/store/useChatStore";

import {
  AttachmentDto,
  ConversationDto,
} from "@/src/common/interface/chat-interface";
import DangerZone from "./DangerZone";
import FileSection from "./FileSection";
import LinkSection from "./LinkSection";
import MediaSection from "./MediaSection";
import OverviewCard from "./OverviewCard";
import ProfileCard from "./ProfileCard";
import SecuritySection from "./SecuritySection";

interface InfConvColumnProps {
  conversationId: string;
}
const EMPTY_ATTACHMENTS: AttachmentDto[] = [];
const EMPTY_LINKS: string[] = [];

const Root = styled(Box)({
  width: 360,
  minWidth: 360,
  height: "100%",
  background: "#F3F5F7",
  borderLeft: "1px solid #E5E7EB",
  overflowY: "auto",
});

const Header = styled(Box)({
  height: 70,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fff",
  borderBottom: "1px solid #E5E7EB",
  position: "sticky",
  top: 0,
  zIndex: 5,
});

const HeaderTitle = styled(Typography)({
  fontSize: 18,
  fontWeight: 700,
  color: "#0F172A",
});

export default function InfConvColumn({
  conversationId,
}: InfConvColumnProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mediaItems = useChatStore(
    (state) => state.mediaByConversation?.[conversationId] ?? EMPTY_ATTACHMENTS
  );

  const fileItems = useChatStore(
    (state) => state.filesByConversation?.[conversationId] ?? EMPTY_ATTACHMENTS
  );

  const links = useChatStore(
    (state) => state.linksByConversation?.[conversationId] ?? EMPTY_LINKS
  );

  if (!conversationId) return null;

  if (!mounted) {
    return (
      <Root>
        <Header>
          <HeaderTitle>Thông tin hội thoại</HeaderTitle>
        </Header>
      </Root>
    );
  }

  return (
    <Root>
      <Header>
        <HeaderTitle>Thông tin hội thoại</HeaderTitle>
      </Header>

      <ProfileCard
      />
      <OverviewCard />
      <MediaSection items={mediaItems} />
      <FileSection items={fileItems} />
      <LinkSection items={links} />
      <SecuritySection />
      <DangerZone />
    </Root>
  );
}