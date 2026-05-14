"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { styled } from "@mui/material/styles";
import PeopleIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SendIcon from "@mui/icons-material/Send";

const FunctionList = styled(List)(({ theme }) => ({
  padding: 0,
}));

const FunctionItem = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 8,
  margin: "4px 8px",
  "&:hover": {
    backgroundColor: "#F8FAFC",
  },
  "&.active": {
    backgroundColor: "#E5F1FF",
    color: "#005AE0",
  },
}));

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
      icon: <PeopleIcon />,
    },
    {
      key: "groups" as ContactView,
      label: t("CONTACT.GROUPS"),
      icon: <GroupsIcon />,
    },
    {
      key: "friendRequests" as ContactView,
      label: t("CONTACT.FRIEND_REQUESTS"),
      icon: <PersonAddIcon />,
    },
    {
      key: "sentRequests" as ContactView,
      label: t("CONTACT.SENT_REQUESTS"),
      icon: <SendIcon />,
    },
  ];

  return (
    <FunctionList>
      {functions.map((func) => (
        <FunctionItem
          key={func.key}
          className={value === func.key ? "active" : ""}
          onClick={() => onChange(func.key)}
        >
          <ListItemIcon>{func.icon}</ListItemIcon>
          <ListItemText primary={func.label} />
        </FunctionItem>
      ))}
    </FunctionList>
  );
};

export default ContactFunctionList;
