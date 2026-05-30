"use client";

import React, { useState } from "react";
import { useTrans } from "@/src/common/utilities/hook/trans";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  InputBase,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import GroupIcon from "@mui/icons-material/Group";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CreateGroupModal from "../chat/CreateGroupModal";

const Root = styled(Box)({
  height: "100%",
  background: "#F7F7F8",
  display: "flex",
  flexDirection: "column",
});

const Header = styled(Box)({
  height: 70,
  background: "#FFFFFF",
  borderBottom: "1px solid #E5E7EB",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 20px",
});

const HeaderTitle = styled(Typography)({
  fontSize: 20,
  fontWeight: 600,
  color: "#000000",
});

const Content = styled(Box)({
  flex: 1,
  padding: 20,
  overflowY: "auto",
});

const SearchWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  height: 42,
  borderRadius: 10,
  background: "#F7F7F8",
  padding: "0 14px",
  marginBottom: 20,
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

const GroupCard = styled(Card)({
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  boxShadow: "none",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#0068FF",
    boxShadow: "0 4px 12px rgba(0, 104, 255, 0.15)",
  },
});

const GroupAvatar = styled(Avatar)({
  width: 48,
  height: 48,
  backgroundColor: "#0068FF",
  fontSize: 18,
  fontWeight: 600,
});

const GroupName = styled(Typography)({
  fontSize: 14,
  fontWeight: 600,
  color: "#000000",
  marginBottom: 4,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const GroupInfo = styled(Typography)({
  fontSize: 13,
  color: "#767A7F",
});

const EmptyState = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: 300,
  color: "#767A7F",
});

const EmptyIcon = styled(Box)({
  width: 80,
  height: 80,
  borderRadius: "50%",
  background: "#F7F7F8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
});

const EmptyText = styled(Typography)({
  fontSize: 15,
  fontWeight: 600,
  color: "#000000",
  marginBottom: 4,
});

const EmptySubtext = styled(Typography)({
  fontSize: 13,
  color: "#767A7F",
});

const CreateButton = styled(Button)({
  height: 36,
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  textTransform: "none",
  background: "#0068FF",
  boxShadow: "none",
  padding: "0 14px",
  "&:hover": {
    background: "#005AE0",
    boxShadow: "none",
  },
});

interface Group {
  id: string;
  name: string;
  memberCount: number;
  avatar?: string;
  description?: string;
}

interface GroupListProps {
  groups?: Group[];
  onCreateGroup?: () => void;
  onGroupClick?: (groupId: string) => void;
}

const GroupList: React.FC<GroupListProps> = ({
  groups = [],
  onCreateGroup = () => {},
  onGroupClick = () => {},
}) => {
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const t = useTrans();

  return (
    <>
      <Root>
        <Header>
          <HeaderTitle>{t("GROUP.YOUR_GROUPS")}</HeaderTitle>
          <CreateButton
            variant="contained"
            startIcon={<GroupIcon sx={{ fontSize: 18 }} />}
            onClick={() => setShowCreateGroupModal(true)}
          >
            {t("GROUP.CREATE_TITLE")}
          </CreateButton>
        </Header>

        <Content>
          {groups.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <PeopleAltIcon sx={{ fontSize: 36, color: "#767A7F" }} />
              </EmptyIcon>
              <EmptyText>{t("GROUP.NO_GROUPS_YET")}</EmptyText>
              <EmptySubtext>{t("GROUP.CREATE_HINT")}</EmptySubtext>
            </EmptyState>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 2,
              }}
            >
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  onClick={() => onGroupClick(group.id)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <GroupAvatar src={group.avatar}>
                        <GroupIcon />
                      </GroupAvatar>
                      <Box flex={1} minWidth={0}>
                        <GroupName>{group.name}</GroupName>
                        <GroupInfo>{t("CHAT.MEMBER_COUNT", { count: group.memberCount })}</GroupInfo>
                        {group.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            sx={{ mt: 0.5 }}
                          >
                            {group.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </GroupCard>
              ))}
            </Box>
          )}
        </Content>
      </Root>

      <CreateGroupModal
        open={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreate={(groupData) => {
          console.log("Creating group:", groupData);
          setShowCreateGroupModal(false);
          onCreateGroup();
        }}
      />
    </>
  );
};

export default GroupList;