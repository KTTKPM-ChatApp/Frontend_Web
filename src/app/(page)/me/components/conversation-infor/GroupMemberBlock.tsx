"use client";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface GroupMemberBlockProps {
  memberCount: number;
  onClick: () => void;
}

const Root = styled(Box)({
  background: "#fff",
  padding: "16px 18px",
  borderTop: "8px solid #F3F5F7",
  borderBottom: "8px solid #F3F5F7",
  cursor: "pointer",
});

const Header = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 14,
});

const Title = styled(Typography)({
  fontSize: 16,
  fontWeight: 600,
  color: "#0F172A",
});

const Row = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 10,
});

const Text = styled(Typography)({
  fontSize: 16,
  color: "#0F172A",
});

export default function GroupMemberBlock({
  memberCount,
  onClick,
}: GroupMemberBlockProps) {
  const t = useTrans();
  return (
    <Root onClick={onClick}>
      <Header>
        <Title>{t("CONVO.MEMBERS_GROUP")}</Title>
        <KeyboardArrowDownRoundedIcon />
      </Header>

      <Row>
        <GroupOutlinedIcon />
        <Text>{memberCount} {t("CONVO.MEMBERS")}</Text>
      </Row>
    </Root>
  );
}