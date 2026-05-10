"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Checkbox,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import GroupIcon from "@mui/icons-material/Group";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";

// ==================== STYLED COMPONENTS ====================

const ModalContent = styled(Box)(({ theme }) => ({
  padding: "20px",
  minHeight: 400,
}));

const AvatarSection = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: 24,
}));

const GroupAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  backgroundColor: "#0078FF",
  marginBottom: 12,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#0056CC",
  },
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: 24,
}));

const SearchSection = styled(Box)(({ theme }) => ({
  marginBottom: 16,
}));

const SearchWrap = styled(Box)(({ theme }) => ({
  height: 40,
  display: "flex",
  alignItems: "center",
  backgroundColor: "#F8FAFC",
  borderRadius: 8,
  padding: "0 12px",
  border: "1px solid #E5E7EB",
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  marginLeft: 8,
  flex: 1,
  fontSize: 14,
  "& input::placeholder": {
    color: "#94A3B8",
  },
}));

const MembersList = styled(Box)(({ theme }) => ({
  maxHeight: 300,
  overflowY: "auto",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
}));

const MemberItem = styled(ListItemButton)(({ theme }) => ({
  padding: "12px 16px",
  borderBottom: "1px solid #F1F5F9",
  "&:last-child": {
    borderBottom: "none",
  },
}));

const SelectedSection = styled(Box)(({ theme }) => ({
  marginBottom: 16,
}));

const SelectedChip = styled(Chip)(({ theme }) => ({
  margin: "4px",
  backgroundColor: "#E0F2FE",
  color: "#0369A1",
  "& .MuiChip-deleteIcon": {
    color: "#0369A1",
  },
}));

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
}

interface CreateGroupModalProps {
  open: boolean;
  onClose?: () => void;
  onCreate?: (groupData: { name: string; description: string; members: string[] }) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  open,
  onClose = () => {},
  onCreate = () => {},
}) => {
  const { t } = useTranslation();
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [friends] = useState<Friend[]>([
    { id: "1", name: "Nguyễn Văn A", avatar: "", phone: "0987654321" },
    { id: "2", name: "Trần Thị B", avatar: "", phone: "0123456789" },
    { id: "3", name: "Lê Văn C", avatar: "", phone: "0912345678" },
    { id: "4", name: "Phạm Thị D", avatar: "", phone: "0987123456" },
    { id: "5", name: "Hoàng Văn E", avatar: "", phone: "0123987654" },
  ]);

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleToggleMember = (friendId: string) => {
    setSelectedMembers(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && onCreate) {
      onCreate({
        name: groupName.trim(),
        description: groupDescription.trim(),
        members: selectedMembers,
      });
      // Reset form
      setGroupName("");
      setGroupDescription("");
      setSelectedMembers([]);
      setSearchValue("");
      onClose();
    }
  };

  const handleClose = () => {
    setGroupName("");
    setGroupDescription("");
    setSelectedMembers([]);
    setSearchValue("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("GROUP.CREATE_TITLE")}</DialogTitle>
      <DialogContent>
        <ModalContent>
          {/* Avatar Section */}
          <AvatarSection>
            <GroupAvatar>
              <GroupIcon sx={{ fontSize: 40, color: "#FFFFFF" }} />
            </GroupAvatar>
            <IconButton
              size="small"
              sx={{ position: "absolute", bottom: 8, right: "50%", transform: "translateX(60px)" }}
            >
              <CameraAltOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </AvatarSection>

          {/* Form Section */}
          <FormSection>
            <TextField
              fullWidth
              label={t("GROUP.NAME_PLACEHOLDER")}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t("GROUP.NAME_PLACEHOLDER")}
              variant="outlined"
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label={t("GROUP.DESCRIPTION_PLACEHOLDER")}
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder={t("GROUP.DESCRIPTION_PLACEHOLDER")}
              variant="outlined"
              multiline
              rows={3}
            />
          </FormSection>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <SelectedSection>
              <Typography variant="subtitle2" sx={{ marginBottom: 1 }}>
                {t("GROUP.SELECTED_MEMBERS", { count: selectedMembers.length })}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedMembers.map(memberId => {
                  const friend = friends.find(f => f.id === memberId);
                  return (
                    <SelectedChip
                      key={memberId}
                      label={friend?.name || "Unknown"}
                      onDelete={() => handleToggleMember(memberId)}
                      size="small"
                    />
                  );
                })}
              </Box>
            </SelectedSection>
          )}

          {/* Search Section */}
          <SearchSection>
            <SearchWrap>
              <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
              <SearchInput
                placeholder={t("GROUP.SEARCH_FRIENDS")}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </SearchWrap>
          </SearchSection>

          {/* Members List */}
          <MembersList>
            {filteredFriends.map(friend => (
              <MemberItem
                key={friend.id}
                onClick={() => handleToggleMember(friend.id)}
                selected={selectedMembers.includes(friend.id)}
              >
                <ListItemIcon>
                  <Avatar sx={{ width: 40, height: 40 }}>
                    {friend.name.charAt(0)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={friend.name}
                  secondary={friend.phone}
                />
                <Checkbox
                  checked={selectedMembers.includes(friend.id)}
                  onChange={() => handleToggleMember(friend.id)}
                />
              </MemberItem>
            ))}
          </MembersList>
        </ModalContent>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("GROUP.CREATE_CANCEL")}</Button>
        <Button
          onClick={handleCreateGroup}
          variant="contained"
          disabled={!groupName.trim() || selectedMembers.length === 0}
        >
          {t("GROUP.CREATE_SUBMIT")} ({selectedMembers.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupModal;
