"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import { styled } from "@mui/material/styles";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CancelIcon from "@mui/icons-material/Cancel";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PersonOffIcon from "@mui/icons-material/PersonOff";

import { useTrans } from "@/src/common/utilities/hook/trans";
import { ContactView } from "./ContactFunctionList";
import FriendList from "./FriendList";
import GroupList from "./GroupList";

import {
  friendService,
  FriendRequestItem,
  FriendUser,
} from "@/src/common/service/friend-service";

import { useChatStore } from "@/src/common/store/useChatStore";
import { openConversation } from "@/src/common/action/chat.action";
import { chatService } from "@/src/common/service/chat-service";

const PanelContainer = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  background: "#F7F9FB",
});

const Header = styled(Box)({
  height: 68,
  background: "#FFFFFF",
  borderBottom: "1px solid #EEF1F4",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 20px",
});

const HeaderTitle = styled(Typography)({
  fontSize: 20,
  fontWeight: 700,
  color: "#081B3A",
});

const Content = styled(Box)({
  flex: 1,
  overflowY: "auto",
  padding: 20,

  "&::-webkit-scrollbar": {
    width: 6,
  },

  "&::-webkit-scrollbar-thumb": {
    background: "#D7DDE5",
    borderRadius: 999,
  },
});

const EmptyState = styled(Box)({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: 32,
});

const EmptyIcon = styled(Box)({
  width: 88,
  height: 88,
  borderRadius: "50%",
  background: "#F1F5F9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 18,
});

const EmptyText = styled(Typography)({
  fontSize: 16,
  fontWeight: 700,
  color: "#081B3A",
  marginBottom: 6,
});

const EmptySubtext = styled(Typography)({
  fontSize: 13,
  color: "#86909C",
});

const SectionTitle = styled(Typography)({
  fontSize: 16,
  fontWeight: 700,
  color: "#081B3A",
  marginBottom: 18,
});

const RequestCard = styled(Card)({
  borderRadius: 16,
  border: "1px solid #EEF1F4",
  boxShadow: "none",
  overflow: "hidden",
  transition: "all 0.2s ease",

  "&:hover": {
    transform: "translateY(-1px)",
    borderColor: "#D8E8FF",
    boxShadow: "0 8px 24px rgba(0,104,255,0.08)",
  },
});

const UserAvatar = styled(Avatar)({
  width: 52,
  height: 52,
  background: "#0068FF",
  fontSize: 18,
  fontWeight: 700,
});

const UserName = styled(Typography)({
  fontSize: 15,
  fontWeight: 700,
  color: "#081B3A",
  marginBottom: 2,
});

const UserMessage = styled(Typography)({
  fontSize: 13,
  color: "#86909C",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: 260,
});

const AcceptButton = styled(Button)({
  height: 36,
  borderRadius: 10,
  background: "#0068FF",
  color: "#FFFFFF",
  fontSize: 13,
  fontWeight: 700,
  textTransform: "none",
  padding: "0 16px",
  boxShadow: "none",

  "&:hover": {
    background: "#0052CC",
    boxShadow: "none",
  },
});

const RejectButton = styled(Button)({
  height: 36,
  borderRadius: 10,
  background: "#FFF1F2",
  color: "#E11D48",
  border: "1px solid #FFE4E6",
  fontSize: 13,
  fontWeight: 700,
  textTransform: "none",
  padding: "0 16px",

  "&:hover": {
    background: "#FFE4E6",
  },
});

const CancelButton = styled(Button)({
  height: 36,
  borderRadius: 10,
  background: "#F3F5F7",
  color: "#5B6575",
  border: "1px solid #E5EAF0",
  fontSize: 13,
  fontWeight: 700,
  textTransform: "none",
  padding: "0 16px",

  "&:hover": {
    background: "#E8ECF1",
  },
});

interface ContactContentPanelProps {
  view: ContactView;
}

const ContactContentPanel: React.FC<
  ContactContentPanelProps
> = ({ view }) => {
  const t = useTrans();

  const [friends, setFriends] = useState<
    FriendUser[]
  >([]);

  const [pendingRequests, setPendingRequests] =
    useState<FriendRequestItem[]>([]);

  const [sentRequests, setSentRequests] =
    useState<FriendRequestItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [groupsRenderKey, setGroupsRenderKey] =
    useState(0);

  const listConversation = useChatStore(
    (s) => s.listConversation
  );

  const fetchListConversation = useChatStore(
    (s) => s.fetchListConversation
  );

  const setActiveConversationId =
    useChatStore(
      (s) => s.setActiveConversationId
    );

  const onlineUserIds = useChatStore(
    (s) => s.onlineUserIds
  );

  const groups = listConversation.filter(
    (c) =>
      c.type === "group" ||
      c.type === "GROUP"
  );

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      if (view === "friends") {
        const res =
          await friendService.getFriends();

        setFriends(
          res?.payload?.data ?? []
        );
      }

      if (view === "friendRequests") {
        const res =
          await friendService.getPendingRequests();

        setPendingRequests(
          res?.payload?.data ?? []
        );
      }

      if (view === "sentRequests") {
        const res =
          await friendService.getSentRequests();

        setSentRequests(
          res?.payload?.data ?? []
        );
      }

      if (view === "groups") {
        await fetchListConversation({
          page: 1,
          limit: 50,
        });

        setGroupsRenderKey(
          (prev) => prev + 1
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchData();
    };
    window.addEventListener("app:refresh_friends", handleRefresh);
    return () => {
      window.removeEventListener("app:refresh_friends", handleRefresh);
    };
  }, [fetchData]);

  const handleRemoveFriend = async (
    friendId: string
  ) => {
    try {
      await friendService.removeFriend(
        friendId
      );

      setFriends((prev) =>
        prev.filter(
          (friend) =>
            friend.id !== friendId
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleFriendClick = async (friendId: string) => {
    const existingConv = listConversation.find((conv) => {
      if (conv.type !== "direct" && conv.type !== "DIRECT") return false;
      return conv.members?.some((m) => m.userId === friendId);
    });

    if (existingConv) {
      await openConversation(existingConv.id);
      return;
    }

    try {
      const response = await chatService.createDirectConversation({
        participantId: friendId,
      });
      const newConversation = (response.payload as any)?.data;
      if (newConversation?.id) {
        await fetchListConversation({ page: 1, limit: 50 });
        await openConversation(newConversation.id);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleAcceptRequest = async (
    requestId: string
  ) => {
    try {
      await friendService.respondToRequest(
        requestId,
        "accepted"
      );

      setPendingRequests((prev) =>
        prev.filter(
          (item) =>
            item.id !== requestId
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleRejectRequest = async (
    requestId: string
  ) => {
    try {
      await friendService.respondToRequest(
        requestId,
        "rejected"
      );

      setPendingRequests((prev) =>
        prev.filter(
          (item) =>
            item.id !== requestId
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelRequest = async (
    requestId: string
  ) => {
    try {
      await friendService.cancelRequest(
        requestId
      );

      setSentRequests((prev) =>
        prev.filter(
          (item) =>
            item.id !== requestId
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const renderEmpty = (
    title: string,
    subTitle: string
  ) => (
    <EmptyState>
      <EmptyIcon>
        <MailOutlineIcon
          sx={{
            fontSize: 40,
            color: "#94A3B8",
          }}
        />
      </EmptyIcon>

      <EmptyText>{title}</EmptyText>

      <EmptySubtext>
        {subTitle}
      </EmptySubtext>
    </EmptyState>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      );
    }

    switch (view) {
      case "friends":
        return (
          <FriendList
            friends={friends.map((f) => ({
              id: f.id,
              name: f.displayName,
              avatar:
                f.avatarUrl ?? undefined,
            }))}
            loading={loading}
            onRemoveFriend={
              handleRemoveFriend
            }
            onFriendClick={handleFriendClick}
            onlineIds={onlineUserIds}
          />
        );

      case "groups":
        return (
          <GroupList
            key={groupsRenderKey}
            groups={groups.map((g) => ({
              id: g.id,
              name: g.name,
              avatar:
                g.avatarUrl ?? undefined,
              memberCount:
                g.members?.length ??
                g.memberCount ??
                0,
            }))}
            onGroupClick={(id) =>
              openConversation(id)
            }
          />
        );

      case "friendRequests":
        return pendingRequests.length ===
          0 ? (
          renderEmpty(
            t("FRIEND.NO_REQUESTS"),
            t("FRIEND.NO_REQUESTS_SUB")
          )
        ) : (
          <Content>
            <SectionTitle>
              {t("FRIEND.REQUESTS_SECTION", { count: pendingRequests.length })}
            </SectionTitle>

            <Stack spacing={2}>
              {pendingRequests.map(
                (req) => (
                  <RequestCard
                    key={req.id}
                  >
                    <CardContent
                      sx={{
                        p: "16px !important",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={2}
                          flex={1}
                          minWidth={0}
                        >
                          <UserAvatar
                            src={
                              req.sender
                                ?.avatarUrl ?? undefined
                            }
                          >
                            {req.sender?.displayName?.charAt(
                              0
                            )}
                          </UserAvatar>

                          <Box minWidth={0}>
                            <UserName>
                              {
                                req.sender
                                  ?.displayName
                              }
                            </UserName>

                            <UserMessage>
                              {req.message ||
                                t("FRIEND.REQUEST_SENT")}
                            </UserMessage>
                          </Box>
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1}
                        >
                          <RejectButton
                            startIcon={
                              <PersonOffIcon />
                            }
                            onClick={() =>
                              handleRejectRequest(
                                req.id
                              )
                            }
                          >
                            {t("FRIEND.REJECT")}
                          </RejectButton>

                          <AcceptButton
                            startIcon={
                              <PersonAddIcon />
                            }
                            onClick={() =>
                              handleAcceptRequest(
                                req.id
                              )
                            }
                          >
                            {t("FRIEND.ACCEPT")}
                          </AcceptButton>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </RequestCard>
                )
              )}
            </Stack>
          </Content>
        );

      case "sentRequests":
        return sentRequests.length ===
          0 ? (
          renderEmpty(
            t("FRIEND.NO_SENT"),
            t("FRIEND.NO_SENT_SUB")
          )
        ) : (
          <Content>
            <SectionTitle>
              {t("FRIEND.SENT_SECTION", { count: sentRequests.length })}
            </SectionTitle>

            <Stack spacing={2}>
              {sentRequests.map((req) => (
                <RequestCard key={req.id}>
                  <CardContent
                    sx={{
                      p: "16px !important",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        flex={1}
                      >
                        <UserAvatar
                          src={
                            req.receiver
                              ?.avatarUrl ?? undefined
                          }
                        >
                          {req.receiver?.displayName?.charAt(
                            0
                          )}
                        </UserAvatar>

                        <Box>
                          <UserName>
                            {
                              req.receiver
                                ?.displayName
                            }
                          </UserName>

                          <UserMessage>
                            {t("FRIEND.PENDING_RESPONSE")}
                          </UserMessage>
                        </Box>
                      </Stack>

                      <CancelButton
                        startIcon={
                          <CancelIcon />
                        }
                        onClick={() =>
                          handleCancelRequest(
                            req.id
                          )
                        }
                      >
                        {t("FRIEND.CANCEL_REQUEST")}
                      </CancelButton>
                    </Stack>
                  </CardContent>
                </RequestCard>
              ))}
            </Stack>
          </Content>
        );

      default:
        return null;
    }
  };

  return (
    <PanelContainer>
      <Header>
        <HeaderTitle>
          {view === "friends" &&
            t("FRIEND.LIST_TITLE")}

          {view === "groups" &&
            t("GROUP.YOUR_GROUPS")}

          {view ===
            "friendRequests" &&
            t("FRIEND.REQUEST_TITLE")}

          {view === "sentRequests" &&
            t("FRIEND.SENT_TITLE")}
        </HeaderTitle>
      </Header>

      {renderContent()}
    </PanelContainer>
  );
};

export default ContactContentPanel;