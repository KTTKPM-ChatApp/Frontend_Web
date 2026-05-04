"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import AppModal from "@/src/shared/component/AppModal";
import AppAvatar from "@/src/shared/component/Avatar";
import { useFriendStore } from "@/src/common/store/useFriendStore";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckIcon from "@mui/icons-material/Check";
import { trace } from "console";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface AddMemberGroupDialogProps {
  open: boolean;
  onClose: () => void;
  existingMemberIds: string[];
  onSubmit: (userIds: string[]) => Promise<void> | void;
}

const SearchWrap = styled(Box)({
  height: 40,
  display: "flex",
  alignItems: "center",
  background: "#F3F4F6",
  borderRadius: 8,
  padding: "0 10px",
  marginBottom: 16,
});

const SearchInput = styled(InputBase)({
  marginLeft: 8,
  flex: 1,
  fontSize: 14,
});
export const UncheckedIcon = styled(Box)({
  width: 16,
  height: 16,
  border: "1px solid #b5b5b5",
  borderRadius: "50%",
  boxSizing: "border-box",
});

export const CheckedIcon = styled(Box)(({ theme }) => ({
  width: 18,
  height: 18,
  border: "1px solid currentColor",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  backgroundColor: theme.palette.primary.main,
  boxSizing: "border-box",
}));

export const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  marginLeft: 0,
  padding: "2px",
  color: theme.palette.primary.main,
  "&.Mui-disabled": {
    color: theme.palette.primary.main,
    opacity: 0.5,
  },
}));
export const StyledCheckIcon = styled(CheckIcon)({
  fontSize: 12,
});
export const RemoveSelectedButton = styled(IconButton)(({ theme }) => ({
  width: 14,
  height: 14,
  padding: 0,
  backgroundColor: theme.palette.primary.dark,
  color: "#FFFFFF",
  "& .MuiSvgIcon-root": {
    fontSize: 10,
  },
  "&:hover": {
    backgroundColor: "#0a3d91",
    transition: "background-color 0.2s ease",
  },
}));
export default function AddMemberGroupDialog({
  open,
  onClose,
  existingMemberIds,
  onSubmit,
}: AddMemberGroupDialogProps) {
  const t = useTrans();
  const friends = useFriendStore((s) => s.friends);
  const fetchFriends = useFriendStore((s) => s.fetchFriends);

  const [keyword, setKeyword] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    void fetchFriends();
  }, [open, fetchFriends]);

  useEffect(() => {
    if (!open) {
      setKeyword("");
      setSelectedUserIds([]);
      setSubmitting(false);
    }
  }, [open]);

  const candidateFriends = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return friends.filter(
      (item) => !q || (item.fullName || "").toLowerCase().includes(q)
    );
  }, [friends, keyword]);

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await onSubmit(selectedUserIds);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={t("CONVO.ADD_MEMBER_TITLE")}
      maxWidth="xs"
      fullWidth
      headerDivider
      actions={
        <>
          <Button onClick={onClose} disabled={submitting}>
            {t("COMMON.BACK")}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || selectedUserIds.length === 0}
          >
            {t("CONVO.ADD_MEMBER_BTN")}
          </Button>
        </>
      }
    >
      <SearchWrap sx={{ marginBottom: "0px" }}>
        <SearchIcon sx={{ fontSize: 20, color: "#6B7280" }} />
        <SearchInput
          placeholder={t("GROUP.SEARCH_FRIENDS")}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </SearchWrap>

      <List sx={{ maxHeight: 360, overflowY: "auto", pt: 0 }}>
        {candidateFriends.map((item) => {
          const isExistingMember = existingMemberIds.includes(item.id);
          const isSelected = selectedUserIds.includes(item.id);
          const checked = isExistingMember || isSelected;

          return (
            <ListItemButton
              key={item.id}
              onClick={() => {
                if (isExistingMember) return;
                toggleUser(item.id);
              }}
              disabled={isExistingMember}
              sx={{
                "&.Mui-disabled": {
                  opacity: 1,
                },
                display: "flex",
                gap: "8px"
              }}
            >
              <ListItemIcon sx={{ minWidth: "20px" }}>
                <StyledCheckbox
                  edge="start"
                  checked={checked}
                  disabled={isExistingMember}
                  tabIndex={-1}
                  icon={<UncheckedIcon />}
                  checkedIcon={
                    <CheckedIcon>
                      <StyledCheckIcon />
                    </CheckedIcon>
                  }
                />
              </ListItemIcon>
              <AppAvatar
                size={40}
                name={item.fullName || "U"}
                src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/${item.avatarUrl}`}
              />

              <ListItemText
                sx={{ fontSize: "14px" }}
                primary={item.fullName || "Người dùng"}
                secondary={isExistingMember ? t("CONVO.ALREADY_JOINED") : undefined}
                slotProps={{
                  secondary: {
                    sx: { fontSize: "12px" }
                  }
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </AppModal>
  );
}