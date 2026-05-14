"use client";

import React from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "4px",
    width: "100%",
  },
}));

const StyledDialogTitle = styled(DialogTitle)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: 16,
  fontWeight: 600,
  paddingBottom: 8,
});

const StyledDialogContent = styled(DialogContent)({
  // paddingTop: "8px !important",
});

const ActionsWrap = styled(Box)({
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
  padding: "16px 24px",
  borderTop: "1px solid #EAECF0",
});

interface AppModalProps {
  open: boolean;
  title?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: DialogProps["maxWidth"];
  fullWidth?: boolean;
  hideCloseButton?: boolean;
  slotProps?: DialogProps["slotProps"];
  headerDivider?: boolean;
  bottomDivider?: boolean;
}

export default function AppModal({
  open,
  title,
  onClose,
  children,
  actions,
  maxWidth = "xs",
  fullWidth = true,
  hideCloseButton = false,
  slotProps,
  headerDivider = false,
  bottomDivider = false,
}: AppModalProps) {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      slotProps={slotProps}
    >
      {title !== undefined && (
        <>
          <StyledDialogTitle>
            <Box component="span">{title}</Box>
            {!hideCloseButton && (
              <IconButton onClick={onClose} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </StyledDialogTitle>

          {headerDivider && <Divider />}
        </>
      )}

      <StyledDialogContent>
        {children}


      </StyledDialogContent>
      {actions ? <ActionsWrap>{actions}</ActionsWrap> : null}
    </StyledDialog>
  );
}