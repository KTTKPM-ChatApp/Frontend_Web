"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputBase,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const Root = styled(Box)({
  background: "#fff",
  marginBottom: 8,
  borderRadius: 8,
});

const Header = styled(Box)({
  minHeight: 56,
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
});

const HeaderLeft = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

const Title = styled(Typography)({
  fontSize: 16,
  fontWeight: 600,
  color: "#000000",
});

const Count = styled(Typography)({
  fontSize: 14,
  fontWeight: 400,
  color: "#767A7F",
});

const ArrowButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ open }) => ({
  width: 28,
  height: 28,
  color: "#767A7F",
  transform: open ? "rotate(180deg)" : "rotate(0deg)",
  transition: "transform 0.2s ease",
}));

const SearchWrap = styled(Box)({
  padding: "0 16px 12px",
});

const StyledSearch = styled(InputBase)({
  width: "100%",
  height: 36,
  padding: "0 12px",
  borderRadius: 8,
  background: "#F7F7F8",
  fontSize: 14,
  "& input::placeholder": {
    color: "#767A7F",
  },
});

const MemberList = styled(Box)({
  padding: "0 16px 16px",
  display: "flex",
  flexDirection: "column",
  gap: 2,
});

const MemberRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "8px 10px",
  borderRadius: 8,
  "&:hover": {
    background: "#F7F7F8",
  },
});

const MemberAvatar = styled(Avatar)({
  width: 44,
  height: 44,
  fontSize: 16,
  fontWeight: 500,
  background: "#0068FF",
});

const MemberInfo = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const MemberName = styled(Typography)({
  fontSize: 14,
  fontWeight: 500,
  color: "#000000",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  lineHeight: 1.4,
});

const OwnerBadge = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  gap: 3,
  backgroundColor: "#FFFBEB",
  color: "#FFB800",
  padding: "2px 8px",
  borderRadius: 10,
  fontSize: 11,
  fontWeight: 600,
  marginTop: 2,
});

const AdminBadge = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  gap: 3,
  backgroundColor: "#F5F3FF",
  color: "#7C3AED",
  padding: "2px 8px",
  borderRadius: 10,
  fontSize: 11,
  fontWeight: 600,
  marginTop: 2,
});

const ActionButton = styled(IconButton)({
  width: 32,
  height: 32,
  color: "#767A7F",
  "&:hover": {
    backgroundColor: "#F7F7F8",
  },
});

const PromoteButton = styled(ActionButton)({
  "&:hover": {
    color: "#7C3AED",
    backgroundColor: "#F5F3FF",
  },
});

const DemoteButton = styled(ActionButton)({
  "&:hover": {
    color: "#E05A00",
    backgroundColor: "#FEF3C7",
  },
});

const RemoveButton = styled(ActionButton)({
  "&:hover": {
    color: "#DB0000",
    backgroundColor: "#FEE2E2",
  },
});

const TransferButton = styled(ActionButton)({
  "&:hover": {
    color: "#FFB800",
    backgroundColor: "#FFFBEB",
  },
});

const ViewAllBtn = styled(Button)({
  height: 40,
  borderRadius: 8,
  background: "#F7F7F8",
  color: "#000000",
  fontSize: 14,
  fontWeight: 500,
  textTransform: "none",
  boxShadow: "none",
  margin: "0 16px 16px",
  "&:hover": {
    background: "#F1F2F4",
    boxShadow: "none",
  },
});

const AddMemberLine = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 18px",
  margin: "0 8px 8px",
  borderRadius: 8,
  cursor: "pointer",
  color: "#0068FF",
  background: "#E3F2FD",
  "&:hover": {
    background: "#BBDEFB",
  },
});

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    borderRadius: 12,
    maxWidth: 360,
  },
});

const DialogTitleStyled = styled(DialogTitle)({
  fontSize: 18,
  fontWeight: 600,
  color: "#000000",
  padding: "20px 24px 16px",
});

const DialogContentStyled = styled(DialogContent)({
  padding: "0 24px 16px",
  "& p": {
    fontSize: 14,
    color: "#767A7F",
    lineHeight: 1.5,
  },
});

const DialogActionsStyled = styled(DialogActions)({
  padding: "8px 16px 16px",
  gap: 8,
});

const CancelButton = styled(Button)({
  height: 40,
  borderRadius: 8,
  background: "#F7F7F8",
  color: "#000000",
  fontSize: 14,
  fontWeight: 500,
  textTransform: "none",
  boxShadow: "none",
  padding: "0 16px",
  "&:hover": {
    background: "#F1F2F4",
    boxShadow: "none",
  },
});

const ConfirmButton = styled(Button)({
  height: 40,
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  textTransform: "none",
  boxShadow: "none",
  padding: "0 16px",
});

const ConfirmButtonDanger = styled(ConfirmButton)({
  background: "#DB0000",
  color: "#fff",
  "&:hover": {
    background: "#B80000",
  },
});

const ConfirmButtonPrimary = styled(ConfirmButton)({
  background: "#0068FF",
  color: "#fff",
  "&:hover": {
    background: "#005AE0",
  },
});

interface Member {
  id: string;
  name: string;
  avatar?: string;
  isAdmin?: boolean;
  isOwner?: boolean;
  phone?: string;
}

type ConfirmActionType =
  | { type: "promote"; memberId: string; memberName: string }
  | { type: "demote"; memberId: string; memberName: string }
  | { type: "remove"; memberId: string; memberName: string }
  | { type: "transfer"; memberId: string; memberName: string }
  | null;

interface GroupMemberListViewProps {
  members?: Member[];
  totalCount?: number;
  searchValue?: string;
  onSearch?: (value: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onAddMember?: () => void;
  onPromoteToAdmin?: (memberId: string) => void;
  onDemoteFromAdmin?: (memberId: string) => void;
  onTransferOwnership?: (memberId: string) => void;
  canManageMembers?: boolean;
  canPromote?: boolean;
}

const GroupMemberListView: React.FC<GroupMemberListViewProps> = ({
  members = [],
  totalCount = 0,
  searchValue = "",
  onSearch = () => {},
  onRemoveMember = () => {},
  onAddMember = () => {},
  onPromoteToAdmin = () => {},
  onDemoteFromAdmin = () => {},
  onTransferOwnership = () => {},
  canManageMembers = false,
  canPromote = false,
}) => {
  const [open, setOpen] = useState(true);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionType>(null);

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const showAll = searchValue || filteredMembers.length <= 5;
  const displayedMembers = showAll ? filteredMembers : filteredMembers.slice(0, 5);

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === "promote") {
      onPromoteToAdmin(confirmAction.memberId);
    } else if (confirmAction.type === "demote") {
      onDemoteFromAdmin(confirmAction.memberId);
    } else if (confirmAction.type === "remove") {
      onRemoveMember(confirmAction.memberId);
    } else if (confirmAction.type === "transfer") {
      onTransferOwnership(confirmAction.memberId);
    }

    setConfirmAction(null);
  };

  const getConfirmTitle = () => {
    if (!confirmAction) return "";
    switch (confirmAction.type) {
      case "promote":
        return "Phong quản trị viên";
      case "demote":
        return "Hạ quyền quản trị viên";
      case "remove":
        return "Xóa thành viên";
      case "transfer":
        return "Chuyển quyền trưởng nhóm";
    }
  };

  const getConfirmMessage = () => {
    if (!confirmAction) return "";
    switch (confirmAction.type) {
      case "promote":
        return `Bạn có chắc chắn muốn phong "${confirmAction.memberName}" làm quản trị viên nhóm?`;
      case "demote":
        return `Bạn có chắc chắn muốn hạ quyền "${confirmAction.memberName}" xuống thành viên thường?`;
      case "remove":
        return `Bạn có chắc chắn muốn xóa "${confirmAction.memberName}" khỏi nhóm?`;
      case "transfer":
        return `Bạn có chắc chắn muốn chuyển quyền trưởng nhóm cho "${confirmAction.memberName}"? Bạn sẽ trở thành quản trị viên.`;
    }
  };

  const isDangerAction = confirmAction?.type === "remove";

  return (
    <Root>
      <Header onClick={() => setOpen((prev) => !prev)}>
        <HeaderLeft>
          <Title>Thành viên nhóm</Title>
          <Count>({totalCount})</Count>
        </HeaderLeft>
        <ArrowButton open={open}>
          <KeyboardArrowDownRoundedIcon />
        </ArrowButton>
      </Header>

      <Collapse in={open}>
        <SearchWrap>
          <StyledSearch
            placeholder="Tìm kiếm thành viên"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            startAdornment={
              <SearchIcon sx={{ fontSize: 18, color: "#767A7F", mr: 1 }} />
            }
          />
        </SearchWrap>

        {filteredMembers.length === 0 ? (
          <Box p="0 16px 16px" textAlign="center" color="#767A7F" fontSize={14}>
            {searchValue ? "Không tìm thấy" : "Chưa có thành viên"}
          </Box>
        ) : (
          <>
            <MemberList>
              {displayedMembers.map((member) => (
                <MemberRow key={member.id}>
                  <MemberAvatar src={member.avatar}>
                    {member.name.charAt(0).toUpperCase()}
                  </MemberAvatar>
                  <MemberInfo>
                    <MemberName>{member.name}</MemberName>
                    {member.isOwner && (
                      <OwnerBadge>
                        <EmojiEventsIcon sx={{ fontSize: 12 }} />
                        Chủ nhóm
                      </OwnerBadge>
                    )}
                    {member.isAdmin && !member.isOwner && (
                      <AdminBadge>
                        <AdminPanelSettingsIcon sx={{ fontSize: 12 }} />
                        Quản trị viên
                      </AdminBadge>
                    )}
                  </MemberInfo>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {canPromote && !member.isOwner && (
                      <>
                        <TransferButton
                          size="small"
                          onClick={() =>
                            setConfirmAction({
                              type: "transfer",
                              memberId: member.id,
                              memberName: member.name,
                            })
                          }
                          title="Chuyển quyền trưởng nhóm"
                        >
                          <SwapHorizIcon sx={{ fontSize: 18 }} />
                        </TransferButton>
                        {!member.isAdmin && (
                          <PromoteButton
                            size="small"
                            onClick={() =>
                              setConfirmAction({
                                type: "promote",
                                memberId: member.id,
                                memberName: member.name,
                              })
                            }
                            title="Phong quản trị viên"
                          >
                            <ArrowForwardIcon sx={{ fontSize: 18 }} />
                          </PromoteButton>
                        )}
                        {member.isAdmin && (
                          <DemoteButton
                            size="small"
                            onClick={() =>
                              setConfirmAction({
                                type: "demote",
                                memberId: member.id,
                                memberName: member.name,
                              })
                            }
                            title="Hạ quyền quản trị viên"
                          >
                            <ArrowForwardIcon sx={{ fontSize: 18, transform: "rotate(180deg)" }} />
                          </DemoteButton>
                        )}
                      </>
                    )}
                    {canManageMembers && !member.isOwner && (
                      <RemoveButton
                        size="small"
                        onClick={() =>
                          setConfirmAction({
                            type: "remove",
                            memberId: member.id,
                            memberName: member.name,
                          })
                        }
                        title="Xóa thành viên"
                      >
                        <PersonRemoveIcon sx={{ fontSize: 18 }} />
                      </RemoveButton>
                    )}
                  </Box>
                </MemberRow>
              ))}
            </MemberList>

            {!showAll && (
              <ViewAllBtn fullWidth>
                Xem tất cả ({filteredMembers.length})
              </ViewAllBtn>
            )}
          </>
        )}

        {canManageMembers && (
          <AddMemberLine onClick={onAddMember}>
            <PersonAddAlt1RoundedIcon sx={{ fontSize: 20 }} />
            <Typography fontSize={14} fontWeight={500}>
              Thêm thành viên
            </Typography>
          </AddMemberLine>
        )}
      </Collapse>

      <StyledDialog open={!!confirmAction} onClose={() => setConfirmAction(null)}>
        <DialogTitleStyled>{getConfirmTitle()}</DialogTitleStyled>
        <DialogContentStyled>
          <Typography>{getConfirmMessage()}</Typography>
        </DialogContentStyled>
        <DialogActionsStyled>
          <CancelButton onClick={() => setConfirmAction(null)}>Hủy</CancelButton>
          {isDangerAction ? (
            <ConfirmButtonDanger onClick={handleConfirmAction}>Xác nhận</ConfirmButtonDanger>
          ) : (
            <ConfirmButtonPrimary onClick={handleConfirmAction}>Xác nhận</ConfirmButtonPrimary>
          )}
        </DialogActionsStyled>
      </StyledDialog>
    </Root>
  );
};

export default GroupMemberListView;
