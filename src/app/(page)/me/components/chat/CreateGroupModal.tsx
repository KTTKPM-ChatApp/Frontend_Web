"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputBase,
  TextField,
  Typography,
} from "@mui/material";

import { styled } from "@mui/material/styles";

import SearchIcon from "@mui/icons-material/Search";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { toast } from "react-toastify";

import { chatService } from "@/src/common/service/chat-service";
import { useFriendStore } from "@/src/common/store/useFriendStore";
import { useChatStore } from "@/src/common/store/useChatStore";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    width: "100%",
    maxWidth: 500,
    borderRadius: 18,
    overflow: "hidden",
    background: "#FFFFFF",
    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
  },
});

const DialogTitleStyled = styled(DialogTitle)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "18px 20px",
  borderBottom: "1px solid #EEF1F4",
});

const DialogContentStyled = styled(DialogContent)({
  padding: 20,
});

const DialogActionsStyled = styled(DialogActions)({
  padding: 16,
  borderTop: "1px solid #EEF1F4",
  gap: 12,
});

const Content = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 18,
});

const AvatarSection = styled(Box)({
  display: "flex",
  justifyContent: "center",
});

const GroupAvatar = styled(Box)({
  width: 84,
  height: 84,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #0068FF 0%, #0052CC 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 24px rgba(0,104,255,0.28)",
});

const FormSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 12,
});

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    fontSize: 14,
    background: "#F7F9FC",

    "& fieldset": {
      borderColor: "#E5EAF0",
    },

    "&:hover fieldset": {
      borderColor: "#0068FF",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#0068FF",
      borderWidth: 1,
    },
  },

  "& .MuiInputBase-input": {
    padding: "12px 14px",
  },
});

const SelectedSection = styled(Box)({
  padding: 14,
  borderRadius: 14,
  background: "#F7F9FC",
  border: "1px solid #EEF1F4",
});

const SelectedHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 10,
});

const SelectedCount = styled(Typography)({
  fontSize: 13,
  fontWeight: 700,
  color: "#5B6575",
});

const SelectedChips = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  maxHeight: 90,
  overflowY: "auto",
});

const SelectedChip = styled(Chip)({
  height: 30,
  borderRadius: 999,
  background: "#E8F1FF",
  color: "#0068FF",
  fontWeight: 600,

  "& .MuiChip-deleteIcon": {
    color: "#0068FF",

    "&:hover": {
      color: "#0052CC",
    },
  },
});

const SearchWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  height: 44,
  borderRadius: 12,
  background: "#F3F5F7",
  padding: "0 14px",
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

  "& input::placeholder": {
    color: "#94A3B8",
    opacity: 1,
  },
});

const MembersSection = styled(Box)({
  maxHeight: 320,
  overflowY: "auto",
  borderRadius: 14,
  border: "1px solid #EEF1F4",

  "&::-webkit-scrollbar": {
    width: 6,
  },

  "&::-webkit-scrollbar-thumb": {
    background: "#D7DDE5",
    borderRadius: 999,
  },
});

const MemberItem = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "12px 16px",
  transition: "all 0.18s ease",
  cursor: "pointer",

  "&:hover": {
    background: "#F8FAFC",
  },

  "&.selected": {
    background: "#EEF5FF",
  },
});

const MemberAvatar = styled(Avatar)({
  width: 48,
  height: 48,
  background: "#0068FF",
  fontWeight: 700,
  fontSize: 16,
});

const MemberInfo = styled(Box)({
  flex: 1,
  marginLeft: 12,
  overflow: "hidden",
});

const MemberName = styled(Typography)({
  fontSize: 14,
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

const CheckIndicator = styled(Box)({
  width: 24,
  height: 24,
  borderRadius: "50%",
  border: "2px solid #D8E0EA",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",

  "&.selected": {
    background: "#0068FF",
    borderColor: "#0068FF",
  },
});

const EmptyState = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 36,
  color: "#86909C",
});

const CancelButton = styled(Button)({
  flex: 1,
  height: 42,
  borderRadius: 12,
  background: "#F3F5F7",
  color: "#081B3A",
  textTransform: "none",
  fontSize: 14,
  fontWeight: 700,

  "&:hover": {
    background: "#E7EBEF",
  },
});

const CreateButton = styled(Button)({
  flex: 1,
  height: 42,
  borderRadius: 12,
  background: "#0068FF",
  textTransform: "none",
  fontSize: 14,
  fontWeight: 700,
  boxShadow: "none",

  "&:hover": {
    background: "#0052CC",
    boxShadow: "none",
  },

  "&:disabled": {
    background: "#DDE3EA",
    color: "#94A3B8",
  },
});

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
}

interface CreateGroupModalProps {
  open: boolean;
  onClose?: () => void;
  onCreate?: (groupData: {
    name: string;
    description: string;
    members: string[];
  }) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  open,
  onClose = () => {},
  onCreate = () => {},
}) => {
  const { t } = useTranslation();

  const fetchListConversation = useChatStore(
    (s) => s.fetchListConversation
  );

  const { friends, fetchFriends } = useFriendStore();

  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open && friends.length === 0) {
      fetchFriends();
    }
  }, [open, friends.length, fetchFriends]);

  const friendList: Friend[] = friends.map((f) => ({
    id: f.id,
    name: f.fullName,
    avatar: f.avatarUrl || undefined,
    phone: f.phone || undefined,
  }));

  const filteredFriends = friendList.filter((friend) =>
    friend.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleToggleMember = (friendId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm");
      return;
    }

    if (selectedMembers.length < 2) {
      toast.error("Cần chọn ít nhất 2 thành viên");
      return;
    }

    setCreating(true);

    try {
      await chatService.createGroupConversation({
        name: groupName.trim(),
        memberIds: selectedMembers,
      });

      onCreate({
        name: groupName.trim(),
        description: groupDescription.trim(),
        members: selectedMembers,
      });

      await fetchListConversation({
        page: 1,
        limit: 20,
      });

      toast.success("Đã tạo nhóm trò chuyện");

      handleClose();
    } catch (error: any) {
      toast.error(
        error?.message || "Không thể tạo nhóm"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setGroupName("");
    setGroupDescription("");
    setSearchValue("");
    setSelectedMembers([]);
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={handleClose}>
      <DialogTitleStyled>
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 700,
            color: "#081B3A",
          }}
        >
          {t("GROUP.CREATE_TITLE")}
        </Typography>

        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            background: "#F3F5F7",

            "&:hover": {
              background: "#E8EBEF",
            },
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitleStyled>

      <DialogContentStyled>
        <Content>
          <AvatarSection>
            <GroupAvatar>
              <GroupRoundedIcon
                sx={{
                  fontSize: 38,
                  color: "#FFFFFF",
                }}
              />
            </GroupAvatar>
          </AvatarSection>

          <FormSection>
            <StyledTextField
              fullWidth
              size="small"
              value={groupName}
              onChange={(e) =>
                setGroupName(e.target.value)
              }
              placeholder={t(
                "GROUP.NAME_PLACEHOLDER"
              )}
            />

            <StyledTextField
              fullWidth
              multiline
              rows={2}
              value={groupDescription}
              onChange={(e) =>
                setGroupDescription(
                  e.target.value
                )
              }
              placeholder={t(
                "GROUP.DESCRIPTION_PLACEHOLDER"
              )}
            />
          </FormSection>

          {selectedMembers.length > 0 && (
            <SelectedSection>
              <SelectedHeader>
                <SelectedCount>
                  Đã chọn ({selectedMembers.length})
                </SelectedCount>
              </SelectedHeader>

              <SelectedChips>
                {selectedMembers.map(
                  (memberId) => {
                    const friend =
                      friendList.find(
                        (f) => f.id === memberId
                      );

                    return (
                      <SelectedChip
                        key={memberId}
                        label={friend?.name}
                        onDelete={() =>
                          handleToggleMember(
                            memberId
                          )
                        }
                      />
                    );
                  }
                )}
              </SelectedChips>
            </SelectedSection>
          )}

          <SearchWrapper>
            <SearchIcon
              sx={{
                fontSize: 20,
                color: "#94A3B8",
              }}
            />

            <StyledSearch
              placeholder={t(
                "GROUP.SEARCH_FRIENDS"
              )}
              value={searchValue}
              onChange={(e) =>
                setSearchValue(e.target.value)
              }
            />
          </SearchWrapper>

          <MembersSection>
            {filteredFriends.length === 0 ? (
              <EmptyState>
                <PersonOutlineRoundedIcon
                  sx={{
                    fontSize: 42,
                    mb: 1,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {searchValue
                    ? "Không tìm thấy bạn bè"
                    : "Chưa có bạn bè"}
                </Typography>
              </EmptyState>
            ) : (
              filteredFriends.map(
                (friend, index) => {
                  const isSelected =
                    selectedMembers.includes(
                      friend.id
                    );

                  return (
                    <Box key={friend.id}>
                      <MemberItem
                        className={
                          isSelected
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          handleToggleMember(
                            friend.id
                          )
                        }
                      >
                        <MemberAvatar
                          src={friend.avatar}
                        >
                          {friend.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </MemberAvatar>

                        <MemberInfo>
                          <MemberName>
                            {friend.name}
                          </MemberName>

                          {friend.phone && (
                            <MemberPhone>
                              {friend.phone}
                            </MemberPhone>
                          )}
                        </MemberInfo>

                        <CheckIndicator
                          className={
                            isSelected
                              ? "selected"
                              : ""
                          }
                        >
                          {isSelected && (
                            <CheckRoundedIcon
                              sx={{
                                fontSize: 15,
                                color: "#FFFFFF",
                              }}
                            />
                          )}
                        </CheckIndicator>
                      </MemberItem>

                      {index !==
                        filteredFriends.length -
                          1 && (
                        <Divider
                          sx={{ ml: 9 }}
                        />
                      )}
                    </Box>
                  );
                }
              )
            )}
          </MembersSection>
        </Content>
      </DialogContentStyled>

      <DialogActionsStyled>
        <CancelButton onClick={handleClose}>
          {t("GROUP.CREATE_CANCEL")}
        </CancelButton>

        <CreateButton
          onClick={handleCreateGroup}
          disabled={
            !groupName.trim() ||
            selectedMembers.length < 2 ||
            creating
          }
        >
          {creating
            ? t("GROUP.CREATING")
            : `${t(
                "GROUP.CREATE_SUBMIT"
              )} (${selectedMembers.length})`}
        </CreateButton>
      </DialogActionsStyled>
    </StyledDialog>
  );
};

export default CreateGroupModal;