"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { styled } from "@mui/material/styles";
import PeopleIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SendIcon from "@mui/icons-material/Send";

const FunctionList = styled(List)({
  padding: 0,
});

const FunctionItem = styled(ListItemButton)({
  borderRadius: 8,
  margin: "4px 8px",
  minHeight: 44,
  "&:hover": {
    backgroundColor: "#F7F7F8",
  },
  "&.active": {
    backgroundColor: "#E3F2FD",
    color: "#0068FF",
  },
  "& .MuiListItemIcon-root": {
    color: "inherit",
  },
});

const StyledListItemText = styled(ListItemText)({
  "& .MuiTypography-root": {
    fontSize: 14,
    fontWeight: 500,
  },
});

export type ContactView = "friends" | "groups" | "friendRequests" | "sentRequests";

interface ContactFunctionListProps {
  value: ContactView;
  onChange: (value: ContactView) => void;
}

const ContactFunctionList: React.FC<ContactFunctionListProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const functions = [
    {
      key: "friends" as ContactView,
      label: t("CONTACT.FRIENDS"),
      icon: <PeopleIcon sx={{ fontSize: 20 }} />,
    },
    {
      key: "groups" as ContactView,
      label: t("CONTACT.GROUPS"),
      icon: <GroupsIcon sx={{ fontSize: 20 }} />,
    },
    {
      key: "friendRequests" as ContactView,
      label: t("CONTACT.FRIEND_REQUESTS"),
      icon: <PersonAddIcon sx={{ fontSize: 20 }} />,
    },
    {
      key: "sentRequests" as ContactView,
      label: t("CONTACT.SENT_REQUESTS"),
      icon: <SendIcon sx={{ fontSize: 20 }} />,
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        background: "#FFFFFF",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: "#767A7F",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            mb: 1,
          }}
        >
          {t("CONTACT.FRIENDS") !== "Friends" ? "Danh mục" : "Category"}
        </Typography>
      </Box>
      <FunctionList>
        {functions.map((func) => (
          <FunctionItem
            key={func.key}
            className={value === func.key ? "active" : ""}
            onClick={() => onChange(func.key)}
          >
            <ListItemIcon>{func.icon}</ListItemIcon>
            <StyledListItemText primary={func.label} />
          </FunctionItem>
        ))}
      </FunctionList>
    </Box>
  );
};

export default ContactFunctionList;