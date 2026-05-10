"use client";

import { Box, Divider, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import ReportGmailerrorredRoundedIcon from "@mui/icons-material/ReportGmailerrorredRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

const Card = styled(Box)({
  background: "#fff",
  marginBottom: 8,
});

const DangerRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "danger",
})<{ danger?: boolean }>(({ danger }) => ({
  minHeight: 58,
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  gap: 12,
  color: danger ? "#DC2626" : "#0F172A",
  cursor: "pointer",

  "&:hover": {
    background: "#F8FAFC",
  },
}));

export default function DangerZone() {
  return (
    <Card>
      <DangerRow>
        <ReportGmailerrorredRoundedIcon />
        <Typography fontSize={15}>Báo xấu</Typography>
      </DangerRow>

      <Divider />

      <DangerRow danger>
        <DeleteOutlineRoundedIcon />
        <Typography fontSize={15}>Xoá lịch sử trò chuyện</Typography>
      </DangerRow>
    </Card>
  );
}