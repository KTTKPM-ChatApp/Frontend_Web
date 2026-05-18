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
import DoneOutlinedIcon from "@mui/icons-material/DoneOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
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
  gap:"8px"
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

export default function PendingRequestFriendList() {
  const t = useTrans();
  const [actionKey, setActionKey] = useState<string | null>(null);

  const {
    pendingRequests,
    loadingPending,
    error,
    fetchPendingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useFriendStore();

  useEffect(() => {
    void fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleAccept = async (requestId: string) => {
    try {
      setActionKey(`accept-${requestId}`);
      await acceptFriendRequest(requestId);
    } finally {
      setActionKey(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setActionKey(`reject-${requestId}`);
      await rejectFriendRequest(requestId);
    } finally {
      setActionKey(null);
    }
  };

  return (
    <Root>
      <Header>
        <PersonAddAltOutlinedIcon />
        <HeaderTitle>{t("FRIEND.REQUEST_TITLE")}</HeaderTitle>
      </Header>

      <Content>
        <SectionTitle>{t("FRIEND.REQUEST_SECTION").replace("{count}", String(pendingRequests.length))}</SectionTitle>

        {error ? <Alert severity="error">{error}</Alert> : null}

        {loadingPending ? (
          <EmptyWrap>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={22} />
              <Typography>{t("FRIEND.REQUEST_LOADING")}</Typography>
            </Stack>
          </EmptyWrap>
        ) : pendingRequests.length === 0 ? (
          <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
            <EmptyWrap>
              <Typography>{t("FRIEND.NO_REQUESTS")}</Typography>
            </EmptyWrap>
          </Card>
        ) : (
          <Stack spacing={2}>
            {pendingRequests.map((request) => {
              const user = request.user;
              const accepting = actionKey === `accept-${request.id}`;
              const rejecting = actionKey === `reject-${request.id}`;

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
                            label="Đã nhận"
                            size="small"
                            sx={{
                              background: "#EFF6FF",
                              color: "#1D4ED8",
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

                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        startIcon={
                          accepting ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <DoneOutlinedIcon />
                          )
                        }
                        disabled={accepting || rejecting}
                        onClick={() => handleAccept(request.id)}
                      >
                        Chấp nhận
                      </Button>

                      <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={
                          rejecting ? (
                            <CircularProgress size={16} />
                          ) : (
                            <CloseOutlinedIcon />
                          )
                        }
                        disabled={accepting || rejecting}
                        onClick={() => handleReject(request.id)}
                      >
                        {t("FRIEND.REJECT")}
                      </Button>
                    </Stack>
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