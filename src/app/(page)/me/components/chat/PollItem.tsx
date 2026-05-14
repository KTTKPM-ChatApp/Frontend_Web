"use client";

import { ConversationPoll } from "@/src/common/interface/conversation-interface";
import { chatService } from "@/src/common/service/chat-service";
import { useAuthStore } from "@/src/common/store/useAuthStore";
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  HowToVote,
  Close,
  Add,
  MoreVert,
  Lock,
  LockOpen,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { toast } from "react-toastify";

const Root = styled(Box)(({ theme }) => ({
  backgroundColor: "#F8FAFF",
  border: "1px solid #E5E7EB",
  borderRadius: "12px",
  padding: "16px",
  margin: "8px 0",
}));

const Header = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "12px",
});

const Question = styled(Typography)({
  fontSize: "16px",
  fontWeight: 600,
  color: "#111827",
  marginBottom: "4px",
});

const Meta = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "12px",
});

const StatusChip = styled(Chip)(({ status }: { status: string }) => ({
  fontSize: "11px",
  height: "20px",
  ...(status === "OPEN" && {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  }),
  ...(status === "CLOSED" && {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  }),
}));

const OptionsContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginBottom: "12px",
});

const OptionItem = styled(Box)<{ theme?: any }>(({ theme }) => ({
  position: "relative",
  padding: "12px",
  borderRadius: "8px",
  border: "2px solid #E5E7EB",
  backgroundColor: "#FFFFFF",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#3B82F6",
    backgroundColor: "#F9FAFB",
  },
  '&[data-is-voted="true"]': {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  '&[data-is-voted="true"]:hover': {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
}));

const ProgressBar = styled(Box)(({ percentage }: { percentage: number }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  width: `${percentage}%`,
  backgroundColor: "rgba(59, 130, 246, 0.1)",
  borderRadius: "6px",
  zIndex: 0,
}));

const OptionContent = styled(Box)({
  position: "relative",
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const OptionLabel = styled(Typography)({
  fontSize: "14px",
  fontWeight: 500,
  color: "#111827",
});

const VoteCount = styled(Typography)({
  fontSize: "12px",
  color: "#6B7280",
  fontWeight: 600,
});

const Percentage = styled(Typography)({
  fontSize: "12px",
  color: "#3B82F6",
  fontWeight: 600,
});

const Actions = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
});

const VoteButton = styled(Button)<{ isVoted?: boolean }>(({ isVoted }) => ({
  ...(isVoted && {
    backgroundColor: "#3B82F6",
    color: "#FFFFFF",
    "&:hover": {
      backgroundColor: "#2563EB",
    },
  }),
}));

interface PollItemProps {
  poll: ConversationPoll;
  conversationId: string;
  onVote?: () => void;
  onWithdraw?: () => void;
  onClose?: () => void;
  onEdit?: () => void;
}

export default function PollItem({
  poll,
  conversationId,
  onVote,
  onWithdraw,
  onClose,
  onEdit,
}: PollItemProps) {
  const authData = useAuthStore((s) => s.authData);
  const [isVoting, setIsVoting] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  const isOwner = poll.createdBy === authData?.data?.user?.id;
  const hasVoted = poll.userVote && poll.userVote.optionIds.length > 0;
  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();

  const handleVote = async () => {
    if (selectedOptions.length === 0) {
      toast.error("Vui lòng chọn ít nhất một lựa chọn");
      return;
    }

    if (poll.status !== "OPEN" || isExpired) {
      toast.error("Cuộc bình chọn đã đóng hoặc hết hạn");
      return;
    }

    setIsVoting(true);
    try {
      await chatService.votePoll(conversationId, poll.id, {
        option_ids: selectedOptions,
      });
      toast.success("Bình chọn thành công!");
      onVote?.();
    } catch (error) {
      toast.error("Không thể bình chọn");
    } finally {
      setIsVoting(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      await chatService.withdrawVote(conversationId, poll.id);
      toast.success("Đã thu hồi bình chọn");
      onWithdraw?.();
    } catch (error) {
      toast.error("Không thể thu hồi bình chọn");
    }
  };

  const handleClose = async () => {
    try {
      await chatService.closePoll(conversationId, poll.id);
      toast.success("Đã đóng cuộc bình chọn");
      onClose?.();
    } catch (error) {
      toast.error("Không thể đóng cuộc bình chọn");
    }
  };

  const handleOptionClick = (optionId: string) => {
    if (poll.status !== "OPEN" || isExpired) return;

    if (poll.allowMultiple) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  return (
    <Root>
      <Header>
        <Box>
          <Question>{poll.question}</Question>
          <Meta>
            <StatusChip
              label={isExpired ? "Hết hạn" : poll.status === "OPEN" ? "Đang mở" : "Đã đóng"}
              status={isExpired ? "CLOSED" : poll.status}
            />
            {poll.isAnonymous && (
              <Tooltip title="Bình chọn ẩn danh">
                <Lock sx={{ fontSize: 16, color: "#6B7280" }} />
              </Tooltip>
            )}
            {poll.allowMultiple && (
              <Tooltip title="Chọn nhiều lựa chọn">
                <HowToVote sx={{ fontSize: 16, color: "#6B7280" }} />
              </Tooltip>
            )}
            <Typography variant="caption" color="#6B7280">
              {totalVotes} bình chọn
            </Typography>
          </Meta>
        </Box>
        {isOwner && (
          <Box>
            {poll.status === "OPEN" && (
              <Tooltip title="Đóng bình chọn">
                <IconButton size="small" onClick={handleClose}>
                  <Lock sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Chỉnh sửa">
                <IconButton size="small" onClick={onEdit}>
                  <MoreVert sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Header>

      <OptionsContainer>
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isSelected = selectedOptions.includes(option.id);
          const isUserVoted = hasVoted && poll.userVote?.optionIds.includes(option.id);

          return (
            <OptionItem
              key={option.id}
              data-is-voted={isUserVoted}
              onClick={() => handleOptionClick(option.id)}
            >
              {(hasVoted || poll.status === "CLOSED") && (
                <ProgressBar percentage={percentage} />
              )}
              <OptionContent>
                <OptionLabel>{option.label}</OptionLabel>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {(hasVoted || poll.status === "CLOSED") && (
                    <>
                      <VoteCount>{option.votes}</VoteCount>
                      <Percentage>{percentage.toFixed(1)}%</Percentage>
                    </>
                  )}
                  {isSelected && poll.status === "OPEN" && (
                    <HowToVote sx={{ fontSize: 16, color: "#3B82F6" }} />
                  )}
                </Box>
              </OptionContent>
            </OptionItem>
          );
        })}
      </OptionsContainer>

      <Actions>
        {poll.status === "OPEN" && !isExpired && (
          <>
            {!hasVoted ? (
              <VoteButton
                variant="contained"
                onClick={handleVote}
                disabled={selectedOptions.length === 0 || isVoting}
                isVoted={selectedOptions.length > 0}
              >
                {isVoting ? "Đang bình chọn..." : "Bình chọn"}
              </VoteButton>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handleWithdraw}
                  disabled={isVoting}
                >
                  Thu hồi
                </Button>
                {poll.allowAddOption && (
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => {
                      // TODO: Open add option modal
                      toast.info("Tính năng thêm lựa chọn đang phát triển");
                    }}
                  >
                    Thêm lựa chọn
                  </Button>
                )}
              </Box>
            )}
          </>
        )}
        
        {poll.expiresAt && (
          <Typography variant="caption" color="#6B7280">
            Hết hạn: {new Date(poll.expiresAt).toLocaleString()}
          </Typography>
        )}
      </Actions>
    </Root>
  );
}
