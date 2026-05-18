"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ContactView } from "./ContactFunctionList";
import FriendList from "./FriendList";
import GroupList from "./GroupList";
import { friendService, FriendUser, FriendRequestItem } from "@/src/common/service/friend-service";
import { useChatStore } from "@/src/common/store/useChatStore";

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
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequestItem[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const listConversation = useChatStore((s) => s.listConversation);
  const fetchListConversation = useChatStore((s) => s.fetchListConversation);
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);
  const onlineUserIds = useChatStore((s) => s.onlineUserIds);

  const groups = listConversation.filter((c) => c.type === "group");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (view === "friends") {
        const res = await friendService.getFriends();
        const list: FriendUser[] = res?.data ?? [];
        setFriends(list);
      } else if (view === "friendRequests") {
        const res = await friendService.getPendingRequests();
        setPendingRequests(res?.data ?? []);
      } else if (view === "sentRequests") {
        const res = await friendService.getSentRequests();
        setSentRequests(res?.data ?? []);
      } else if (view === "groups") {
        await fetchListConversation({ page: 1, limit: 50 });
      }
    } catch (err) {
      console.error("Failed to fetch contact data:", err);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await friendService.removeFriend(friendId);
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    } catch (err) {
      console.error("Failed to remove friend:", err);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendService.respondToRequest(requestId, "accepted");
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error("Failed to accept request:", err);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendService.respondToRequest(requestId, "rejected");
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error("Failed to reject request:", err);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await friendService.cancelRequest(requestId);
      setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error("Failed to cancel request:", err);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <EmptyState>
          <CircularProgress />
        </EmptyState>
      );
    }

    switch (view) {
      case "friends":
        return (
          <FriendList
            friends={friends.map((f) => ({
              id: f.id,
              name: f.displayName,
              avatar: f.avatarUrl ?? undefined,
            }))}
            loading={loading}
            onSearch={setSearchQuery}
            onRemoveFriend={handleRemoveFriend}
            onlineIds={onlineUserIds}
          />
        );
      case "groups":
        return (
          <GroupList
            groups={groups.map((g) => ({
              id: g.id,
              name: g.name,
              memberCount: g.memberCount ?? 0,
              avatar: g.avatarUrl ?? undefined,
            }))}
            onGroupClick={(id) => setActiveConversationId(id)}
          />
        );
      case "friendRequests":
        return pendingRequests.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📭</EmptyIcon>
            <Typography variant="h6">Không có lời mời kết bạn</Typography>
            <Typography variant="body2">
              Bạn sẽ thấy lời mời kết bạn ở đây
            </Typography>
          </EmptyState>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Lời mời kết bạn ({pendingRequests.length})
            </Typography>
            {pendingRequests.map((req) => (
              <Box
                key={req.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  mb: 1,
                  bgcolor: "#fff",
                  borderRadius: 2,
                  border: "1px solid #E5E7EB",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: "#E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748B",
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {req.sender?.displayName?.charAt(0) || "?"}
                  </Box>
                  <Box>
                    <Typography fontWeight={600}>{req.sender?.displayName || "Unknown"}</Typography>
                    {req.message && (
                      <Typography variant="body2" color="text.secondary">
                        {req.message}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleRejectRequest(req.id)}
                  >
                    Từ chối
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleAcceptRequest(req.id)}
                  >
                    Chấp nhận
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        );
      case "sentRequests":
        return sentRequests.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📤</EmptyIcon>
            <Typography variant="h6">Không có lời mời đã gửi</Typography>
            <Typography variant="body2">
              Bạn sẽ thấy lời mời đã gửi ở đây
            </Typography>
          </EmptyState>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Lời mời đã gửi ({sentRequests.length})
            </Typography>
            {sentRequests.map((req) => (
              <Box
                key={req.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  mb: 1,
                  bgcolor: "#fff",
                  borderRadius: 2,
                  border: "1px solid #E5E7EB",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: "#E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748B",
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {req.receiver?.displayName?.charAt(0) || "?"}
                  </Box>
                  <Typography fontWeight={600}>{req.receiver?.displayName || "Unknown"}</Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  color="warning"
                  onClick={() => handleCancelRequest(req.id)}
                >
                  Hủy yêu cầu
                </Button>
              </Box>
            ))}
          </Box>
        );
      default:
        return null;
    }
  };

  return <PanelContainer>{renderContent()}</PanelContainer>;
};

export default ContactContentPanel;
