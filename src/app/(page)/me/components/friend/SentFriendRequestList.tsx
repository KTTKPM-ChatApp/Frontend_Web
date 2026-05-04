"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ForwardToInboxOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { useFriendStore } from "@/src/common/store/useFriendStore";
import { useTrans } from "@/src/common/utilities/hook/trans";

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
  gap: "8px",
});

const HeaderTitle = styled(Typography)({
  fontSize: 16,
  fontWeight: 600,
  color: "#0F172A",
});

const Content = styled(Box)({
  flex: 1,
  padding: 20,
  overflowY: "auto",
});

const SectionTitle = styled(Typography)({
  fontSize: 16,
  fontWeight: 700,
  color: "#0F172A",
  marginBottom: 14,
});

const EmptyWrap = styled(Box)({
  height: 260,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748B",
});

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
}

export default function SentFriendRequestList() {
  const t = useTrans();
  const [actionKey, setActionKey] = useState<string | null>(null);

  const {
    sentRequests,
    loadingSent,
    error,
    fetchSentRequests,
    cancelFriendRequest,
  } = useFriendStore();

  useEffect(() => {
    void fetchSentRequests();
  }, [fetchSentRequests]);

  const handleCancel = async (requestId: string) => {
    try {
      setActionKey(requestId);
      await cancelFriendRequest(requestId);
    } catch (error) {
      console.error(error);
    } finally {
      setActionKey(null);
    }
  };

  return (
    <Root>
      <Header> <ForwardToInboxOutlinedIcon/>
        <HeaderTitle>{t("FRIEND.SENT_TITLE")}</HeaderTitle>
      </Header>

      <Content>
        <SectionTitle>{t("FRIEND.SENT_SECTION").replace("{count}", String(sentRequests.length))}</SectionTitle>

        {error ? <Alert severity="error">{error}</Alert> : null}

        {loadingSent ? (
          <EmptyWrap>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={22} />
              <Typography>{t("FRIEND.SENT_LOADING")}</Typography>
            </Stack>
          </EmptyWrap>
        ) : sentRequests.length === 0 ? (
          <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
            <EmptyWrap>
              <Typography>{t("FRIEND.NO_SENT")}</Typography>
            </EmptyWrap>
          </Card>
        ) : (
          <Stack spacing={2}>
            {sentRequests.map((request) => {
              const user = request.receiver;
              const cancelling = actionKey === request.id;
              return (
                <Card
                  key={request.id}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid #E5E7EB",
                    boxShadow: "none",
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={user?.avatarUrl || undefined}
                        alt={user?.fullName}
                        sx={{ width: 52, height: 52 }}
                      >
                        {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </Avatar>

                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            sx={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}
                          >
                            {user?.fullName || "Người dùng"}
                          </Typography>

                          <Chip
                            label="Đã gửi"
                            size="small"
                            sx={{
                              background: "#FFF7ED",
                              color: "#C2410C",
                              fontWeight: 600,
                            }}
                          />
                        </Stack>

                        <Typography sx={{ fontSize: 13, color: "#64748B", mt: 0.5 }}>
                          {user?.phone || `Gửi lúc ${formatDate(request.createdAt)}`}
                        </Typography>

                        {request.message ? (
                          <Typography sx={{ fontSize: 13, color: "#475569", mt: 1 }}>
                            {request.message}
                          </Typography>
                        ) : null}
                      </Box>
                    </Stack>

                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={
                        cancelling ? (
                          <CircularProgress size={16} />
                        ) : (
                          <CloseOutlinedIcon />
                        )
                      }
                      disabled={cancelling}
                      onClick={() => handleCancel(request.id)}
                    >
                      {t("FRIEND.CANCEL_REQUEST")}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Content>
    </Root>
  );
}