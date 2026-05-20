"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import SearchIcon from "@mui/icons-material/Search";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    width: "100%",
    maxWidth: 460,
    borderRadius: 16,
    overflow: "hidden",
    background: "#FFFFFF",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  },
});

const DialogTitleStyled = styled(DialogTitle)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "18px 20px 14px",
  borderBottom: "1px solid #F1F2F4",
});

const DialogContentStyled = styled(DialogContent)({
  padding: 16,
});

const SearchWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  height: 42,
  borderRadius: 12,
  background: "#F3F5F7",
  padding: "0 14px",
  marginBottom: 16,
  border: "1px solid transparent",
  transition: "all 0.2s ease",

  "&:focus-within": {
    borderColor: "#0068FF",
    background: "#FFFFFF",
  },
});

const StyledSearch = styled(InputBase)({
  flex: 1,
  marginLeft: 8,
  fontSize: 14,
  color: "#081B3A",

  "& input::placeholder": {
    color: "#86909C",
    opacity: 1,
  },
});

const MemberList = styled(List)({
  maxHeight: 420,
  overflowY: "auto",
  padding: 0,

  "&::-webkit-scrollbar": {
    width: 6,
  },

  "&::-webkit-scrollbar-thumb": {
    background: "#D9DDE3",
    borderRadius: 999,
  },
});

const MemberItem = styled(ListItem)({
  padding: "10px 12px",
  borderRadius: 14,
  transition: "all 0.2s ease",

  "&:hover": {
    background: "#F5F7FA",
  },
});

const MemberName = styled(Typography)({
  fontSize: 15,
  fontWeight: 600,
  color: "#081B3A",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const MemberPhone = styled(Typography)({
  fontSize: 13,
  color: "#86909C",
  marginTop: 2,
});

const AddButton = styled(Button)({
  minWidth: 90,
  height: 34,
  borderRadius: 999,
  background: "#EAF2FF",
  color: "#0068FF",
  textTransform: "none",
  fontSize: 13,
  fontWeight: 600,
  boxShadow: "none",
  padding: "0 14px",

  "&:hover": {
    background: "#DCEBFF",
    boxShadow: "none",
  },
});

const EmptyState = styled(Box)({
  height: 240,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
});

const EmptyIcon = styled(Box)({
  width: 64,
  height: 64,
  borderRadius: "50%",
  background: "#F3F5F7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 14,
});

const DialogActionsStyled = styled(DialogActions)({
  padding: 16,
  borderTop: "1px solid #F1F2F4",
});

const CloseButton = styled(Button)({
  width: "100%",
  height: 42,
  borderRadius: 12,
  background: "#F3F5F7",
  color: "#081B3A",
  fontSize: 14,
  fontWeight: 600,
  textTransform: "none",

  "&:hover": {
    background: "#E8EBEF",
  },
});

interface AddMemberGroupDialogProps {
  open: boolean;
  friends?: Array<{
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
  }>;
  onClose?: () => void;
  onAddMember?: (memberId: string) => void;
}

const AddMemberGroupDialog: React.FC<AddMemberGroupDialogProps> = ({
  open,
  friends = [],
  onClose = () => {},
  onAddMember = () => {},
}) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      (f.phone && f.phone.includes(searchValue))
  );

  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogTitleStyled>
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 700,
            color: "#081B3A",
          }}
        >
          {t("GROUP.ADD_MEMBER_TITLE")}
        </Typography>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            width: 32,
            height: 32,
            background: "#F3F5F7",

            "&:hover": {
              background: "#E8EBEF",
            },
          }}
        >
          <CloseRoundedIcon
            sx={{
              fontSize: 18,
              color: "#5C6675",
            }}
          />
        </IconButton>
      </DialogTitleStyled>

      <DialogContentStyled>
        <SearchWrapper>
          <SearchIcon
            sx={{
              fontSize: 20,
              color: "#86909C",
            }}
          />

          <StyledSearch
            placeholder={t("GROUP.SEARCH_MEMBERS")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </SearchWrapper>

        {filteredFriends.length > 0 ? (
          <MemberList>
            {filteredFriends.map((friend, index) => (
              <Box key={friend.id}>
                <MemberItem disablePadding>
                  <Box
                    display="flex"
                    alignItems="center"
                    width="100%"
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={friend.avatar}
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "#0068FF",
                          fontWeight: 700,
                          fontSize: 16,
                        }}
                      >
                        {friend.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      sx={{ mr: 1 }}
                      primary={
                        <MemberName>
                          {friend.name}
                        </MemberName>
                      }
                      secondary={
                        friend.phone ? (
                          <MemberPhone>
                            {friend.phone}
                          </MemberPhone>
                        ) : null
                      }
                    />

                    <AddButton
                      startIcon={
                        <PersonAddAlt1RoundedIcon
                          sx={{ fontSize: 16 }}
                        />
                      }
                      onClick={() =>
                        onAddMember(friend.id)
                      }
                    >
                      {t("COMMON.ADD")}
                    </AddButton>
                  </Box>
                </MemberItem>

                {index !== filteredFriends.length - 1 && (
                  <Divider sx={{ ml: 8 }} />
                )}
              </Box>
            ))}
          </MemberList>
        ) : (
          <EmptyState>
            <EmptyIcon>
              <SearchIcon
                sx={{
                  fontSize: 30,
                  color: "#AAB2BD",
                }}
              />
            </EmptyIcon>

            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: "#081B3A",
              }}
            >
              {friends.length === 0 ? t("GROUP.NO_FRIENDS_TO_ADD") : t("GROUP.FRIEND_NOT_FOUND")}
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                color: "#86909C",
                mt: 0.5,
              }}
            >
              {friends.length === 0 ? "Bạn chưa có bạn bè để thêm" : "Thử tìm kiếm bằng tên hoặc số điện thoại"}
            </Typography>
          </EmptyState>
        )}
      </DialogContentStyled>

      <DialogActionsStyled>
        <CloseButton onClick={onClose}>
          {t("COMMON.CLOSE")}
        </CloseButton>
      </DialogActionsStyled>
    </StyledDialog>
  );
};

export default AddMemberGroupDialog;