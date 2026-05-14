"use client";

import { useState } from "react";
import { Box, Switch, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import SectionBlock from "./SectionBlock";

const SecurityRow = styled(Box)({
  minHeight: 62,
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
});

const SecurityLeft = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
});

const SecurityTitle = styled(Typography)({
  fontSize: 15,
  color: "#0F172A",
});

const SecuritySub = styled(Typography)({
  fontSize: 13,
  color: "#64748B",
  marginTop: 2,
});

export default function SecuritySection() {
  const [hideConversation, setHideConversation] = useState(false);

  return (
    <SectionBlock title="Thiết lập bảo mật" defaultOpen>
      <SecurityRow>
        <SecurityLeft>
          <TimerOutlinedIcon />
          <Box>
            <SecurityTitle>Tin nhắn tự xoá</SecurityTitle>
            <SecuritySub>Không bao giờ</SecuritySub>
          </Box>
        </SecurityLeft>
      </SecurityRow>

      <SecurityRow>
        <SecurityLeft>
          <VisibilityOffOutlinedIcon />
          <SecurityTitle>Ẩn trò chuyện</SecurityTitle>
        </SecurityLeft>

        <Switch
          checked={hideConversation}
          onChange={(_, checked) => setHideConversation(checked)}
        />
      </SecurityRow>
    </SectionBlock>
  );
}
