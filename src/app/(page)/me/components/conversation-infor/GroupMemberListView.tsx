"use client";

import { useMemo, useState } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import AppAvatar from "@/src/shared/component/Avatar";
import MenuPopover, { PopoverMenuItem } from "@/src/shared/component/MenuPopover";
import { useChatStore } from "@/src/common/store/useChatStore";
import { ConversationMemberDto } from "@/src/common/interface/chat-interface";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface GroupMemberListViewProps {
  onBack: () => void;
  onOpenAddMember: () => void;
  onRemoveMember: (member: ConversationMemberDto) => void;
  onUpdateMemberRole: (
    member: ConversationMemberDto,
    role: "admin" | "member"
  ) => void | Promise<void>;
}

const Wrap = styled(Box)({
  background: "#fff",
  minHeight: "100%",
});
const AddMemberButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#e5e7eb",
  color: "#081b3a",
  textTransform: "none",
  fontWeight: 600,
  width: "100%",
  "&:hover": {
    backgroundColor: "#c6cad2",
  },
}));
const Header = styled(Box)({
  height: 70,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "sticky",
  top: 0,
  background: "#fff",
  borderBottom: "1px solid #E5E7EB",
  zIndex: 5,
});

const BackBtn = styled(IconButton)({
  position: "absolute",
  left: 8,
});

const Title = styled(Typography)({
  fontSize: 18,
  fontWeight: 700,
  color: "#0F172A",
});

const AddBtnWrap = styled(Box)({
  padding: 16,
});

const SectionTitle = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 16px 8px",
});

const MemberRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 16px",
});

const MemberInfo = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
});

const NameWrap = styled(Box)({
  display: "flex",
  flexDirection: "column",
});

const Name = styled(Typography)({
  fontSize: 15,
  fontWeight: 600,
  color: "#0F172A",
});

const Role = styled(Typography)({
  fontSize: 13,
  color: "#6B7280",
});

const canRemoveMember = (
  myRole?: "owner" | "admin" | "member",
  memberRole?: "owner" | "admin" | "member",
  isSelf?: boolean
) => {
  if (!myRole || !memberRole) return false;
  if (isSelf) return false;

  if (myRole === "owner") {
    return memberRole === "admin" || memberRole === "member";
  }

  if (myRole === "admin") {
    return memberRole === "member";
  }

  return false;
};

const canManageMember = (
  myRole?: "owner" | "admin" | "member",
  memberRole?: "owner" | "admin" | "member",
  isSelf?: boolean
) => {
  if (!myRole || !memberRole) return false;
  if (isSelf) return false;

  if (myRole === "owner") {
    return memberRole === "admin" || memberRole === "member";
  }

  if (myRole === "admin") {
    return memberRole === "member";
  }

  return false;
};

const canUpdateMemberRole = (
  myRole?: "owner" | "admin" | "member",
  memberRole?: "owner" | "admin" | "member",
  isSelf?: boolean
) => {
  if (!myRole || !memberRole) return false;
  if (isSelf) return false;

  // Only Owner can update member roles
  if (myRole === "owner") {
    return memberRole === "admin" || memberRole === "member";
  }

  return false;
};

export default function GroupMemberListView({
  onBack,
  onOpenAddMember,
  onRemoveMember,
  onUpdateMemberRole,
}: GroupMemberListViewProps) {
  const t = useTrans();
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedMember, setSelectedMember] = useState<ConversationMemberDto | null>(null);

  const conversationId = useChatStore((s) => s.activeConversationId);
  const currentUserId = useChatStore((s) => s.currentUserId);
  const conversationDetail = useChatStore(
    (s) => s.conversationDetailById[conversationId ?? ""] ?? null
  );

  const members = conversationDetail?.members ?? [];
  const myRole = conversationDetail?.mySettings?.role ?? 'member';

  const handleOpenMemberMenu = (
    event: React.MouseEvent<HTMLElement>,
    member: ConversationMemberDto
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleCloseMemberMenu = () => {
    setMenuAnchorEl(null);
    setSelectedMember(null);
  };

  const handleUpdateMemberRole = async (
    member: ConversationMemberDto,
    role: "admin" | "member"
  ) => {
    await onUpdateMemberRole(member, role);

    setSelectedMember((prev) =>
      prev && prev.id === member.id ? { ...prev, role } : prev
    );

    handleCloseMemberMenu();
  };

  const memberMenuItems = useMemo<PopoverMenuItem[]>(() => {
    if (!selectedMember || !currentUserId) return [];

    const isSelf = selectedMember.userId === currentUserId;
    const removable = canRemoveMember(myRole, selectedMember.role, isSelf);
    const updatableRole = canUpdateMemberRole(myRole, selectedMember.role, isSelf);

    const items: PopoverMenuItem[] = [];

    if (updatableRole) {
      if (selectedMember.role === "member") {
        items.push({
          key: "promote-admin",
          label: t("CONVO.ADD_DEPUTY"),
          onClick: () => void handleUpdateMemberRole(selectedMember, "admin"),
        });
      }

      if (selectedMember.role === "admin") {
        items.push({
          key: "demote-member",
          label: t("CONVO.REMOVE_DEPUTY"),
          onClick: () => void handleUpdateMemberRole(selectedMember, "member"),
        });
      }
    }

    if (removable) {
      items.push({
        key: "remove-member",
        label: t("CONVO.REMOVE_FROM_GROUP"),
        danger: true,
        dividerTop: items.length > 0,
        onClick: () => onRemoveMember(selectedMember),
      });
    }

    return items;
  }, [selectedMember, currentUserId, myRole, onRemoveMember]);

  return (
    <Wrap>
      <Header>
        <BackBtn onClick={onBack}>
          <ArrowBackIosNewRoundedIcon fontSize="small" />
        </BackBtn>
        <Title>{t("CONVO.MEMBERS")}</Title>
      </Header>

      <AddBtnWrap>
        <AddMemberButton
          startIcon={<PersonAddAlt1OutlinedIcon />}
          onClick={onOpenAddMember}
        >
          {t("CONVO.ADD_MEMBER")}
        </AddMemberButton>
      </AddBtnWrap>

      <SectionTitle>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
          {t("CONVO.MEMBER_LIST").replace("{count}", String(members.length))}
        </Typography>
        <IconButton size="small">
          <MoreHorizRoundedIcon />
        </IconButton>
      </SectionTitle>

      {members.map((member) => {
        const avatarSrc = member.avatarUrl
          ? `${(process.env.NEXT_PUBLIC_S3_BASE_URL || "")
            .replace(/\/+$/, "")}/${member.avatarUrl.replace(/^\/+/, "")}`
          : "";

        const isSelf = member.userId === currentUserId;

        return (
          <MemberRow key={member.id}>
            <MemberInfo>
              <AppAvatar
                size={40}
                name={member.nickname || member.fullName || "U"}
                src={avatarSrc}
              />
              <NameWrap>
                <Name>{member.nickname || member.fullName}</Name>
                {(member.role === "owner" || member.role === "admin") && (
                  <Role>
                    {member.role === "owner" ? t("CONVO.ROLE_OWNER") : t("CONVO.ROLE_ADMIN")}
                  </Role>
                )}
              </NameWrap>
            </MemberInfo>

            {canManageMember(myRole, member.role, isSelf) && (
              <IconButton
                size="small"
                onClick={(event) => handleOpenMemberMenu(event, member)}
              >
                <MoreHorizRoundedIcon fontSize="small" />
              </IconButton>
            )}
          </MemberRow>
        );
      })}

      <MenuPopover
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl) && memberMenuItems.length > 0}
        onClose={handleCloseMemberMenu}
        items={memberMenuItems}
        width={190}
      />
    </Wrap>
  );
}