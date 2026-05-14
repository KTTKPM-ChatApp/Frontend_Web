"use client";

import {
  Box,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PushPinIcon from "@mui/icons-material/PushPin";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const PinnedContainer = styled(Box)({
  height: 48,
  minHeight: 48,
  maxHeight: 48,
  background: "#FEF3C7",
  borderBottom: "1px solid #FDE68A",
  display: "flex",
  alignItems: "center",
  padding: "0 16px",
  gap: 12,
});

const PinnedIcon = styled(PushPinIcon)({
  fontSize: 18,
  color: "#D97706",
  transform: "rotate(45deg)",
});

const PinnedText = styled(Typography)({
  fontSize: 14,
  color: "#92400E",
  fontWeight: 500,
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const PinnedSender = styled(Typography)({
  fontSize: 12,
  color: "#B45309",
  fontWeight: 600,
  marginRight: 8,
});

const ExpandButton = styled(IconButton)({
  width: 24,
  height: 24,
  color: "#D97706",
});

const CloseButton = styled(IconButton)({
  width: 24,
  height: 24,
  color: "#D97706",
});

interface PinnedBarProps {
  pinnedMessage?: {
    id: string;
    content: string;
    sender?: {
      name: string;
    };
    timestamp: string;
  };
  onExpand?: () => void;
  onClose?: () => void;
}

const PinnedBar: React.FC<PinnedBarProps> = ({
  pinnedMessage,
  onExpand = () => {},
  onClose = () => {},
}) => {
  if (!pinnedMessage) return null;

  return (
    <PinnedContainer>
      <PinnedIcon />
      
      <Stack direction="row" alignItems="center" flex={1} minWidth={0}>
        {pinnedMessage.sender && (
          <PinnedSender variant="caption">
            {pinnedMessage.sender.name}
          </PinnedSender>
        )}
        <PinnedText>
          {pinnedMessage.content}
        </PinnedText>
      </Stack>

      <ExpandButton size="small" onClick={onExpand}>
        <ExpandMoreIcon fontSize="small" />
      </ExpandButton>

      <CloseButton size="small" onClick={onClose}>
        <CloseIcon fontSize="small" />
      </CloseButton>
    </PinnedContainer>
  );
};

export default PinnedBar;
