"use client";

import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import GroupIcon from "@mui/icons-material/Group";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CreateGroupModal from "../chat/CreateGroupModal";

const Root = styled(Box)({
  height: "100%",
  background: "#F3F5F7",
  display: "flex",
  flexDirection: "column",
});

const Header = styled(Box)({
  height: 76,
  background: "#FFFFFF",
  borderBottom: "1px solid #E5E7EB",
  display: "flex",
  alignItems: "center",
  padding: "0 20px",
});

const HeaderTitle = styled(Typography)({
  fontSize: 24,
  fontWeight: 700,
  color: "#0F172A",
});

const Content = styled(Box)({
  flex: 1,
  padding: 20,
  overflowY: "auto",
});

const GroupCard = styled(Card)({
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  boxShadow: "none",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
});

const GroupAvatar = styled(Avatar)({
  width: 48,
  height: 48,
  backgroundColor: "#005AE0",
});

const GroupName = styled(Typography)({
  fontSize: 16,
  fontWeight: 600,
  color: "#0F172A",
  marginBottom: 4,
});

const GroupInfo = styled(Typography)({
  fontSize: 14,
  color: "#64748B",
});

interface GroupListProps {
  groups?: Array<{
    id: string;
    name: string;
    memberCount: number;
    avatar?: string;
    description?: string;
  }>;
  onCreateGroup?: () => void;
  onGroupClick?: (groupId: string) => void;
}

const GroupList: React.FC<GroupListProps> = ({
  groups = [],
  onCreateGroup = () => {},
  onGroupClick = () => {},
}) => {
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  const handleCreateGroup = () => {
    console.log("Create group:", { name: groupName, description: groupDescription });
    setShowCreateGroupModal(false);
    setGroupName("");
    setGroupDescription("");
    onCreateGroup();
  };

  return (
    <>
      <Root>
        <Header>
          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
            <HeaderTitle>Nhóm của bạn</HeaderTitle>
            <Button
              variant="contained"
              startIcon={<GroupIcon />}
              onClick={() => setShowCreateGroupModal(true)}
            >
              Tạo nhóm
            </Button>
          </Box>
        </Header>

        <Content>
          {groups.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height={300}
              color="#64748B"
            >
              <PeopleAltIcon sx={{ fontSize: 64, mb: 2 }} />
              <Typography>Chưa có nhóm nào</Typography>
              <Typography variant="body2" mt={1}>
                Tạo nhóm mới để bắt đầu trò chuyện
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {groups.map((group) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={group.id}>
                  <GroupCard onClick={() => onGroupClick(group.id)}>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <GroupAvatar src={group.avatar}>
                          <GroupIcon />
                        </GroupAvatar>
                        <Box flex={1}>
                          <GroupName>{group.name}</GroupName>
                          <GroupInfo>{group.memberCount} thành viên</GroupInfo>
                          {group.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {group.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </GroupCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Content>
      </Root>

      <CreateGroupModal
        open={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreate={(groupData) => {
          console.log("Creating group:", groupData);
          handleCreateGroup();
        }}
      />
    </>
  );
};

export default GroupList;
