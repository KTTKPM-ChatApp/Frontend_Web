"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";

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

const SectionTitle = styled(Typography)({
  fontSize: 16,
  fontWeight: 700,
  color: "#0F172A",
  marginBottom: 14,
});

const FilterWrap = styled(Box)({
  padding: 16,
  background: "#FFFFFF",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  marginBottom: 16,
});

const ListCard = styled(Card)({
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  boxShadow: "none",
});

const EmptyWrap = styled(Box)({
  height: 260,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748B",
});

function normalizeText(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

export default function FriendList() {
  const t = useTrans();
  const [keyword, setKeyword] = useState("");
  const [actionKey, setActionKey] = useState<string | null>(null);

  const friends = useFriendStore((s) => s.friends);
  const fetchFriends = useFriendStore((s) => s.fetchFriends);
  const removeFriend = useFriendStore((s) => s.removeFriend);
  const loadingFriends = useFriendStore((s) => s.loadingFriends);
  const error = useFriendStore((s) => s.error);

  useEffect(() => {
    void fetchFriends();
  }, [fetchFriends]);

  const filteredFriends = useMemo(() => {
    const q = normalizeText(keyword);

    if (!q) return friends;

    return friends.filter((item) => {
      const fullName = normalizeText(item.fullName);
      const phone = normalizeText(item.phone);
      const bio = normalizeText(item.bio);
      return fullName.includes(q) || phone.includes(q) || bio.includes(q);
    });
  }, [friends, keyword]);

  const handleRemoveFriend = async (friendId: string) => {
    try {
      setActionKey(friendId);
      await removeFriend(friendId);
    } finally {
      setActionKey(null);
    }
  };

  return (
    <Root>
      <Header>
        <HeaderTitle>{t("FRIEND.LIST_TITLE")}</HeaderTitle>
      </Header>

      <Content>
        <SectionTitle>{t("FRIEND.SECTION_TITLE").replace("{count}", String(friends.length))}</SectionTitle>

        <FilterWrap>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm bạn"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#64748B" }} />
                </InputAdornment>
              ),
            }}
          />
        </FilterWrap>

        {error ? <Alert severity="error">{error}</Alert> : null}

        {loadingFriends ? (
          <EmptyWrap>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={22} />
              <Typography>{t("FRIEND.LOADING")}</Typography>
            </Stack>
          </EmptyWrap>
        ) : filteredFriends.length === 0 ? (
          <ListCard>
            <EmptyWrap>
              <Typography>{t("FRIEND.NO_FRIENDS")}</Typography>
            </EmptyWrap>
          </ListCard>
        ) : (
          <ListCard>
            {filteredFriends.map((friend, index) => {
              const removing = actionKey === friend.id;

              return (
                <CardContent
                  key={friend.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    borderBottom:
                      index < filteredFriends.length - 1
                        ? "1px solid #F1F5F9"
                        : "none",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={friend.avatarUrl || undefined}
                      alt={friend.fullName}
                      sx={{ width: 48, height: 48 }}
                    >
                      {friend.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </Avatar>

                    <Box>
                      <Typography
                        sx={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}
                      >
                        {friend.fullName || "Người dùng"}
                      </Typography>

                      <Typography sx={{ fontSize: 13, color: "#64748B", mt: 0.5 }}>
                        {friend.phone || friend.bio || t("FRIEND.IN_SYSTEM")}
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#FFFFFF",
                      backgroundColor: "#D50000",
                      textTransform: "none",
                      padding: "6px 16px",
                    }}
                    startIcon={
                      removing ? (
                        <CircularProgress  />
                      ) : (
                        <PersonRemoveOutlinedIcon />
                      )
                    }
                    disabled={removing}
                    onClick={() => handleRemoveFriend(friend.id)}
                  >
                    {t("FRIEND.REJECT")}
                  </Button>
                </CardContent>
              );
            })}
          </ListCard>
        )}
      </Content>
    </Root>
  );
}