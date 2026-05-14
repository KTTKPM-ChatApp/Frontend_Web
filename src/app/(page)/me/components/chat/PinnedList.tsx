"use client";

import { Box, Typography, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import PushPinIcon from "@mui/icons-material/PushPin";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { UiMessage, ConversationMemberDto } from "@/src/common/interface/chat-interface";
import PinnedItem from "./PinnedItem";

interface PinnedListProps {
  pinnedMessages: UiMessage[];
  members?: ConversationMemberDto[];
  currentUserId?: string;
  onPressMessage: (message: UiMessage) => void;
  onUnpinMessage: (message: UiMessage) => void;
  onCollapse: () => void;
  onMenuClick: (message: UiMessage, event?: React.MouseEvent<HTMLElement>) => void;
}

const Container = styled(Box)(({ theme }) => ({
  backgroundColor: "#F7F8FA",
  borderBottom: "1px solid #E5E7EB",
}));

const Header = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 12px",
  borderBottom: "1px solid #E5E7EB",
});

const HeaderLeft = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

const HeaderTitle = styled(Typography)({
  fontSize: 13,
  fontWeight: 600,
  color: "#111827",
});

const CollapseButton = styled(IconButton)({
  padding: 4,
  color: "#6B7280",
  "&:hover": {
    color: "#111827",
    backgroundColor: "#E5E7EB",
  },
});

const ListContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  padding: "4px 0",
  maxHeight: 300,
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: 6,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#D1D5DB",
    borderRadius: 3,
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "transparent",
  },
});

export default function PinnedList({
  pinnedMessages,
  members,
  currentUserId,
  onPressMessage,
  onUnpinMessage,
  onCollapse,
  onMenuClick,
}: PinnedListProps) {
  return (
    <Container>
      <Header>
        <HeaderLeft>
          <PushPinIcon sx={{ fontSize: 16, color: "#fff" }} />
          <HeaderTitle>Danh sách ghim ({pinnedMessages.length})</HeaderTitle>
        </HeaderLeft>
        <CollapseButton size="small" onClick={onCollapse}>
          <ExpandLessIcon sx={{ fontSize: 18 }} />
        </CollapseButton>
      </Header>
      <ListContent>
        {pinnedMessages.map((message, index) => (
          <PinnedItem
            key={message.messageId || `pinned-${index}`}
            message={message}
            members={members}
            currentUserId={currentUserId}
            onPress={() => onPressMessage(message)}
            onUnpin={() => onUnpinMessage(message)}
            onMenu={(e) => onMenuClick(message, e)}
          />
        ))}
      </ListContent>
    </Container>
  );
}
