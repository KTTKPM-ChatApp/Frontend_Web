"use client";

import { useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import { uploadMedia } from "@/src/common/service/media-service";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useChatStore } from "@/src/common/store/useChatStore";
import AppAvatar, { buildS3Url } from "@/src/shared/component/Avatar";
import AddMemberGroupDialog from "./AddMemberGroupDialog";
import { groupService } from "@/src/common/service/group-service";
import CreateGroupModal from "../chat/CreateGroupModal";
import { chatService } from "@/src/common/service/chat-service";
import AppModal from "@/src/shared/component/AppModal";
import { fetchListConversation } from "@/src/common/action/chat.action";
import { useTrans } from "@/src/common/utilities/hook/trans";

const Card = styled(Box)({
  background: "#fff",
  marginBottom: 8,
});

const TopInfo = styled(Box)({
  padding: "28px 20px 20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const NameRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 14,
  marginBottom: 18,
});

const ConversationName = styled(Typography)({
  fontSize: 18,
  fontWeight: 700,
  color: "#0F132A",
  maxWidth: 220,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const EditCircleButton = styled(IconButton)({
  width: 24,
  height: 24,
  background: "#E5E7EB",
  color: "#212121",
  "&:hover": {
    background: "#dbdbdb",
  },
});

const ActionsRow = styled(Box)({
  width: "100%",
  display: "flex",
  justifyContent: "space-around",
  gap: 8,
  marginTop: 4,
});

const ActionItem = styled(Box)({
  width: 90,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: 8,
});
const GroupNameTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",

    "& fieldset": {
      border: "1px solid #D8D9DB",
    },
    "&:hover fieldset": {
      border: "1px solid #D8D9DB",
    },
    "&.Mui-focused fieldset": {
      border: "1px solid #D8D9DB",
    },
  },

  "& .MuiOutlinedInput-input": {
    fontSize: 13,
    padding: "8px 10px",
  },
});
const ActionIcon = styled(IconButton)({
  width: 32,
  height: 32,
  background: "#E5E7EB",
  color: "#212121",
  "&:hover": {
    background: "#dbdbdb",
  },
});
const EditAvatarWrap = styled(Box)({
  position: "relative",
  cursor: "pointer",
});

const EditAvatarBadge = styled(Box)({
  position: "absolute",
  right: -2,
  bottom: -2,
  width: 22,
  height: 22,
  borderRadius: "50%",
  backgroundColor: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
});
const ActionText = styled(Typography)({
  fontSize: 13,
  color: "#0F172A",
  lineHeight: 1.35,
});

export default function ProfileCard() {
  const t = useTrans();
  const listConversation = useChatStore((s) => s.listConversation);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const fetchConversationDetail = useChatStore((s) => s.fetchConversationDetail);
  const conversationDetail = useChatStore((s) => s.conversationDetailById?.[activeConversationId || ""] ?? null);
  const currentUserId = useChatStore((s) => s.currentUserId);
  const updateConversationPinStatus = useChatStore(
    (s) => s.updateConversationPinStatus
  );
  const listItemConversation = listConversation.find(
    (cvs) => cvs.id === activeConversationId
  );

  const currentConversation = conversationDetail ?? listItemConversation;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [groupAvatarFile, setGroupAvatarFile] = useState<File | null>(null);
  const [groupAvatarPreview, setGroupAvatarPreview] = useState("");
  const isPinned = Boolean(listItemConversation?.isPinned);
  const [openCreateGroupDialog, setOpenCreateGroupDialog] = useState(false);
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [openEditGroupNameDialog, setOpenEditGroupNameDialog] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [updatingGroupName, setUpdatingGroupName] = useState(false);
  const [openEditNicknameDialog, setOpenEditNicknameDialog] = useState(false);
  const [nickname, setNickname] = useState("");
  const [updatingNickname, setUpdatingNickname] = useState(false);
  const isGroup = conversationDetail?.type === "group";
  const members = conversationDetail?.members ?? currentConversation?.members ?? [];
  const myRole = conversationDetail?.mySettings?.role ?? 'member';
  const myNickname = conversationDetail?.mySettings?.nickname ?? "";
  const canEditGroup = isGroup && (myRole === 'owner' || myRole === 'admin');

  const otherMember = !isGroup
    ? members.find((m) => m.userId !== currentUserId)
    : null;

  const displayName = isGroup
    ? currentConversation?.name ?? ""
    : otherMember?.nickname || otherMember?.fullName || currentConversation?.name || "";

  const displayAvatar = isGroup
    ? buildS3Url(currentConversation?.avatarUrl)
    : buildS3Url(otherMember?.avatarUrl || currentConversation?.avatarUrl);

  const handleGroupAction = () => {
    if (isGroup) {
      setOpenAddMemberDialog(true);
      return;
    }
    setOpenCreateGroupDialog(true);
  };
  const handleTogglePinConversation = async () => {
    if (!activeConversationId) return;

    try {
      if (isPinned) {
        await chatService.unpinConversation(activeConversationId);
        updateConversationPinStatus(activeConversationId, false);
      } else {
        await chatService.pinConversation(activeConversationId);
        updateConversationPinStatus(activeConversationId, true);
      }
    } catch (error) {
      console.error("Pin/unpin conversation failed", error);
    }
  };
  const handleOpenEditName = () => {
    if (!isGroup) return;

    setGroupName(displayName);
    setGroupAvatarFile(null);
    setGroupAvatarPreview("");
    setOpenEditGroupNameDialog(true);
  };
  const handleUpdateGroupName = async () => {
    if (!activeConversationId) return;

    const nextName = groupName.trim();
    if (!nextName) return;

    try {
      setUpdatingGroupName(true);

      let nextAvatarUrl = currentConversation?.avatarUrl ?? null;

      if (groupAvatarFile) {
        const uploadResult = await uploadMedia({
          file: groupAvatarFile,
          userId: currentUserId ?? "",
        });

        nextAvatarUrl = uploadResult.key ?? nextAvatarUrl;
      }

      await groupService.updateConversation(
        activeConversationId,
        nextName,
        nextAvatarUrl
      );

      await fetchConversationDetail(activeConversationId, true);
      await fetchListConversation({ page: 1, limit: 10 });

      setOpenEditGroupNameDialog(false);
    } catch (error) {
      console.error("Update group failed", error);
    } finally {
      setUpdatingGroupName(false);
    }
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

  const handleOpenEditNickname = () => {
    setNickname(myNickname);
    setOpenEditNicknameDialog(true);
  };

  const handleSaveNickname = async () => {
    if (!activeConversationId) return;

    const trimmedNickname = nickname.trim();

    if (trimmedNickname.length > 100) {
      alert("Nickname không được quá 100 ký tự");
      return;
    }

    try {
      setUpdatingNickname(true);
      await groupService.updateMySettings(activeConversationId, trimmedNickname || undefined);
      await fetchConversationDetail(activeConversationId, true);
      await fetchListConversation({ page: 1, limit: 10 });
      setOpenEditNicknameDialog(false);
    } catch (error) {
      console.error("Update nickname failed", error);
      alert("Không thể cập nhật nickname");
    } finally {
      setUpdatingNickname(false);
    }
  };

  return (
    <>
      <Card>
        <TopInfo>
          <AppAvatar
            src={displayAvatar}
            name={displayName}
            size={56}
            fontSize={22}
          />

          <NameRow>
            <ConversationName title={displayName}>
              {displayName}
            </ConversationName>

            {canEditGroup && (
              <EditCircleButton onClick={handleOpenEditName}>
                <EditOutlinedIcon sx={{ fontSize: "16px" }} />
              </EditCircleButton>
            )}
          </NameRow>

          <ActionsRow>
            <ActionItem>
              <ActionIcon>
                <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
              </ActionIcon>
              <ActionText>Tắt thông báo</ActionText>
            </ActionItem>

            <ActionItem>
              <ActionIcon onClick={handleTogglePinConversation}>
                <PushPinOutlinedIcon
                  sx={{
                    fontSize: 20,
                    color: isPinned ? "#0068FF" : "inherit",
                    rotate: isPinned ? "45deg" : "0deg",
                  }}
                />
              </ActionIcon>

              <ActionText>
                {isPinned ? t("COMMON.UNPIN_CHAT") : t("COMMON.PIN_CHAT")}
              </ActionText>
            </ActionItem>

            <ActionItem>
              <ActionIcon onClick={handleOpenEditNickname}>
                <EditOutlinedIcon sx={{ fontSize: 20 }} />
              </ActionIcon>
              <ActionText>{t("CONVO.CHANGE_NICKNAME")}</ActionText>
            </ActionItem>

            {canEditGroup && (
              <ActionItem>
                <ActionIcon onClick={handleGroupAction}>
                  <GroupAddOutlinedIcon sx={{ fontSize: 20 }} />
                </ActionIcon>
                <ActionText>
                  {isGroup ? t("CONVO.ADD_MEMBER") : t("CONVO.CREATE_GROUP_CHAT")}
                </ActionText>
              </ActionItem>
            )}
          </ActionsRow>
        </TopInfo>
      </Card>

      <CreateGroupModal
        open={openCreateGroupDialog}
        onClose={() => setOpenCreateGroupDialog(false)}
      />

      <AddMemberGroupDialog
        open={openAddMemberDialog}
        onClose={() => setOpenAddMemberDialog(false)}
        existingMemberIds={members.map((m) => m.userId)}
        onSubmit={async (userIds) => {
          if (!activeConversationId) return;
          await groupService.addMembersToGroup(activeConversationId, userIds);
          await fetchConversationDetail(activeConversationId, true);
        }}
      />
      <AppModal

        open={openEditGroupNameDialog}
        headerDivider
        onClose={() => setOpenEditGroupNameDialog(false)}
        title={t("CONVO.UPDATE_AVATAR_NAME")}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ alignItems: "center", display: "flex", flexDirection: "column" }}>
            <EditAvatarWrap onClick={handleChooseGroupAvatar}>
              <AppAvatar
                src={groupAvatarPreview || displayAvatar}
                name={displayName}
                size={66}
              />

              <EditAvatarBadge>
                <CameraAltOutlinedIcon sx={{ fontSize: 14, color: "#4B5563" }} />
              </EditAvatarBadge>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleGroupAvatarChange}
              />
            </EditAvatarWrap>
          </Box>
          <Typography sx={{ fontSize: 12.5, textAlign: "center" }}>
            {t("CONVO.UPDATE_NAME_CONFIRM")}
          </Typography>

          <GroupNameTextField
            fullWidth
            size="small"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            autoFocus
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              color="inherit"
              onClick={() => setOpenEditGroupNameDialog(false)}
              disabled={updatingGroupName}
              sx={{
                textTransform: "none",
              }}
            >
              {t("COMMON.BACK")}
            </Button>

            <Button
              onClick={handleUpdateGroupName}
              disabled={updatingGroupName || !groupName.trim()}
              sx={{
                backgroundColor: (theme) => theme.palette.primary.main,
                color: "#fff",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.primary.dark,
                },
              }}
            >
              {t("CONVO.CONFIRM")}
            </Button>

          </Box>
        </Box>
      </AppModal>

      <AppModal
        open={openEditNicknameDialog}
        headerDivider
        onClose={() => setOpenEditNicknameDialog(false)}
        title="Đổi biệt danh"
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontSize: 12.5, textAlign: "center" }}>
            Đặt biệt danh cho người này trong cuộc trò chuyện này.
          </Typography>

          <GroupNameTextField
            fullWidth
            size="small"
            placeholder="Nhập biệt danh..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            autoFocus
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              color="inherit"
              onClick={() => setOpenEditNicknameDialog(false)}
              disabled={updatingNickname}
              sx={{
                textTransform: "none",
              }}
            >
              {t("COMMON.BACK")}
            </Button>

            <Button
              onClick={handleSaveNickname}
              disabled={updatingNickname}
              sx={{
                backgroundColor: (theme) => theme.palette.primary.main,
                color: "#fff",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.primary.dark,
                },
              }}
            >
              {updatingNickname ? "Đang lưu..." : "Lưu"}
            </Button>

          </Box>
        </Box>
      </AppModal>
    </>
  );
}