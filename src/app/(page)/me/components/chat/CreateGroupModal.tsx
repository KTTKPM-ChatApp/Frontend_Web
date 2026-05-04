"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import AppModal from "@/src/shared/component/AppModal";
import AppAvatar, { buildS3Url } from "@/src/shared/component/Avatar";
import { useFriendStore } from "@/src/common/store/useFriendStore";
import { useChatStore } from "@/src/common/store/useChatStore";
import { groupService } from "@/src/common/service/group-service";
import { openConversation } from "@/src/common/action/chat.action";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { CheckedIcon, RemoveSelectedButton, StyledCheckbox, StyledCheckIcon, UncheckedIcon } from "../conversation-infor/AddMemberGroupDialog";
import { useFormik } from "formik";
import { createGroupValidationSchema, initialValues } from "./validation/validateCreateGroup";
import { uploadMedia } from "@/src/common/service/media-service";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
}

const SearchWrap = styled(Box)({
  height: 40,
  display: "flex",
  alignItems: "center",
  // background: "#F3F4F6",
  borderRadius: 8,
  padding: "0 10px",
  marginBottom: 16,
});

const SearchInput = styled(InputBase)({
  marginLeft: 8,
  flex: 1,
  fontSize: 14,
});

export const SelectedWrap = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 16,
  minHeight: 24,
});

export const SelectedItem = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "#EEF4FF",
  borderRadius: 16,
  padding: "4px 10px",
});
const GroupAvatarUpload = styled(Box)({
  width: 48,
  height: 48,
  borderRadius: "50%",
  border: "1px solid #D8D9DB",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flexShrink: 0,
  position: "relative",
});

export default function CreateGroupModal({ open, onClose }: CreateGroupModalProps) {
  const t = useTrans();
  const friends = useFriendStore((s) => s.friends);
  const fetchFriends = useFriendStore((s) => s.fetchFriends);

  const upsertConversationToTop = useChatStore((s) => s.upsertConversationToTop);
  const setConversationDetail = useChatStore((s) => s.setConversationDetail);
  const fetchConversationDetail = useChatStore((s) => s.fetchConversationDetail);

  const [groupName, setGroupName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [groupAvatarFile, setGroupAvatarFile] = useState<File | null>(null);
  const [groupAvatarPreview, setGroupAvatarPreview] = useState("");
  const formik = useFormik({
    initialValues,
    validationSchema: createGroupValidationSchema,
    onSubmit: async (values) => {
      if (selectedUserIds.length < 2) return;

      try {
        setSubmitting(true);

        let avatarUrl: string | null = null;

        if (groupAvatarFile) {
          const uploadResult = await uploadMedia({
            file: groupAvatarFile,
          });

          avatarUrl = uploadResult.key ?? null;
        }

        const res = await groupService.createGroupConversation(
          values.groupName.trim(),
          selectedUserIds,
          avatarUrl
        );

        const newConversation = res?.payload?.data;
        if (!newConversation) throw new Error(t("GROUP.CREATE_FAILED"));

        upsertConversationToTop(newConversation);
        setConversationDetail(newConversation.id, newConversation);

        onClose();

        await openConversation(newConversation.id);
        await fetchConversationDetail(newConversation.id, true);
      } catch (error: any) {
        formik.setFieldError("groupName", error?.message || t("GROUP.CREATE_FAILED"));
      } finally {
        setSubmitting(false);
      }
    },
  });
  useEffect(() => {
    if (!open) return;
    void fetchFriends();
  }, [open, fetchFriends]);

  useEffect(() => {
    if (!open) {
      if (groupAvatarPreview) {
        URL.revokeObjectURL(groupAvatarPreview);
      }

      formik.resetForm();
      setKeyword("");
      setSelectedUserIds([]);
      setSubmitting(false);
      setGroupAvatarFile(null);
      setGroupAvatarPreview("");
    }
  }, [open]);

  const filteredFriends = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return friends;

    return friends.filter((item) =>
      (item.fullName || "").toLowerCase().includes(q)
    );
  }, [friends, keyword]);

  const selectedFriends = useMemo(
    () => friends.filter((item) => selectedUserIds.includes(item.id)),
    [friends, selectedUserIds]
  );

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };
  const handleChooseGroupAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleGroupAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }

    if (groupAvatarPreview) {
      URL.revokeObjectURL(groupAvatarPreview);
    }

    setGroupAvatarFile(file);
    setGroupAvatarPreview(URL.createObjectURL(file));

    event.target.value = "";
  };
  const handleCreateGroup = async () => {
    if (selectedUserIds.length < 2) {
      alert(t("GROUP.ALERT_MIN_MEMBERS"));
      return;
    }

    try {
      setSubmitting(true);

      const res = await groupService.createGroupConversation(
        groupName.trim() || "",
        selectedUserIds
      );

      const newConversation = res?.payload?.data;
      if (!newConversation) {
        throw new Error(t("GROUP.CREATE_FAILED"));
      }

      upsertConversationToTop(newConversation);
      setConversationDetail(newConversation.id, newConversation);

      onClose();

      await openConversation(newConversation.id);
      await fetchConversationDetail(newConversation.id, true);
    } catch (error: any) {
      alert(error?.message || t("GROUP.CREATE_FAILED"));
    } finally {
      setSubmitting(false);
    }
  };
  console.log("selectedFriends:", selectedFriends);
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={t("GROUP.CREATE_TITLE")}
      maxWidth="xs"
      fullWidth
      headerDivider
      actions={
        <>
          <Button onClick={onClose} disabled={submitting}>
            {t("GROUP.CREATE_CANCEL")}
          </Button>
          <Button
            variant="contained"
            onClick={() => formik.handleSubmit()}
            disabled={submitting || selectedUserIds.length < 2}
          >
            {submitting ? t("GROUP.CREATING") : t("GROUP.CREATE_SUBMIT")}
          </Button>
        </>
      }
    >
      <SearchWrap
        sx={{
          mb: formik.touched.groupName && formik.errors.groupName ? 0.5 : 2,
          gap: 1.5,
          px: 0,
          height: 48,
        }}
      >
        <GroupAvatarUpload onClick={handleChooseGroupAvatar}>
          {groupAvatarPreview ? (
            <AppAvatar
              size={48}
              fontSize={18}
              name={formik.values.groupName}
              src={groupAvatarPreview}
            />
          ) : (
            <CameraAltOutlinedIcon
              sx={{
                fontSize: 22,
                color: "#6B7280",
              }}
            />
          )}
        </GroupAvatarUpload>

        <InputBase
          name="groupName"
          placeholder={t("GROUP.NAME_PLACEHOLDER")}
          value={formik.values.groupName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          sx={{
            flex: 1,
            fontSize: 13,
            backgroundColor: "#fff",
            borderBottom: "1px solid #D1D5DB",
            "&:focus-within": {
              borderBottom: "1px solid #2563EB",
            },
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleGroupAvatarChange}
        />
      </SearchWrap>

      {formik.touched.groupName && formik.errors.groupName && (
        <Typography sx={{ fontSize: 12, color: "#D93025", mb: 2 }}>
          {formik.errors.groupName}
        </Typography>
      )}

      <Typography sx={{ mb: 1, fontSize: 13, color: "#6B7280" }}>
        {t("GROUP.SELECTED_MEMBERS").replace("{count}", String(selectedUserIds.length))}
      </Typography>

      <SelectedWrap>
        {selectedFriends.map((item) => (
          <SelectedItem key={item.id}>
            <AppAvatar
              size={24}
              fontSize={12}
              name={item.fullName || "U"}
              src={buildS3Url(item.avatarUrl) || ""}
            />

            <Typography
              sx={{
                fontSize: 12,
                maxWidth: 120,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.fullName || t("CHAT.USER")}
            </Typography>

            <RemoveSelectedButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                toggleUser(item.id);
              }}
            >
              <CloseIcon />
            </RemoveSelectedButton>
          </SelectedItem>
        ))}
      </SelectedWrap>

      <SearchWrap sx={{border:"1px solid #E5E7EB",borderRadius: 8, ":focus-within":{borderColor: "#2563EB"}}}>
        <SearchIcon sx={{ fontSize: 20, color: "#6B7280" }} />
        <SearchInput
          placeholder={t("GROUP.SEARCH_FRIENDS")}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </SearchWrap>

      <List sx={{ maxHeight: 320, overflowY: "auto", pt: 0 }}>
        {filteredFriends.map((item) => {
          const checked = selectedUserIds.includes(item.id);

          return (
            <ListItemButton
              key={item.id}
              onClick={() => toggleUser(item.id)}
              sx={{
                display: "flex",
                gap: "8px",
                borderRadius: 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: "28px" }}>
                <StyledCheckbox
                  edge="start"
                  checked={checked}
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
                size={36}
                name={item.fullName || "U"}
                src={buildS3Url(item.avatarUrl) || ""}
                sx={{ mr: 1.5 }}
              />

              <ListItemText primary={item.fullName || t("CHAT.USER")} />
            </ListItemButton>
          );
        })}
      </List>
    </AppModal>
  );
}