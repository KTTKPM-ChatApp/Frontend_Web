"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ContactView } from "./ContactFunctionList";
import FriendList from "./FriendList";
import GroupList from "./GroupList";

const PanelContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: 32,
  color: "#64748B",
}));

const EmptyIcon = styled(Box)(({ theme }) => ({
  fontSize: 48,
  marginBottom: 16,
  opacity: 0.5,
}));

interface ContactContentPanelProps {
  view: ContactView;
}

const ContactContentPanel: React.FC<ContactContentPanelProps> = ({ view }) => {
  const renderContent = () => {
    switch (view) {
      case "friends":
        return <FriendList />;
      case "groups":
        return <GroupList />;
      case "friendRequests":
        return (
          <EmptyState>
            <EmptyIcon>📭</EmptyIcon>
            <Typography variant="h6">Không có lời mời kết bạn</Typography>
            <Typography variant="body2">
              Bạn sẽ thấy lời mời kết bạn ở đây
            </Typography>
          </EmptyState>
        );
      case "sentRequests":
        return (
          <EmptyState>
            <EmptyIcon>📤</EmptyIcon>
            <Typography variant="h6">Không có lời mời đã gửi</Typography>
            <Typography variant="body2">
              Bạn sẽ thấy lời mời đã gửi ở đây
            </Typography>
          </EmptyState>
        );
      default:
        return null;
    }
  };

  return <PanelContainer>{renderContent()}</PanelContainer>;
};

export default ContactContentPanel;
