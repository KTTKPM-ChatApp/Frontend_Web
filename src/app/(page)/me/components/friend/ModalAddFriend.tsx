"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  InputBase,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AppModal from "@/src/shared/component/AppModal";
import { searchService } from "@/src/common/service/search-service";
import { useDebounce } from "@/src/common/utilities/hook/debounce";
import { IUserSearchItem } from "@/src/common/interface/search-interface";
import FriendRequestConfirmModal from "./FriendRequestConfirmModal";
import { friendService } from "@/src/common/service/friend-service";
import { useFriendStore } from "@/src/common/store/useFriendStore";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface AddFriendDialogProps {
  open: boolean;
  onClose: () => void;
  suggestions?: IUserSearchItem[];
  onSendFriendRequest?: (payload: {
    user: IUserSearchItem;
    message: string;
  }) => Promise<void> | void;
  onCancelFriendRequest?: (payload: {
    user: IUserSearchItem;
    requestId: string;
  }) => Promise<void> | void;
}

const PhoneBar = styled(Box)({
  display: "flex",
  alignItems: "center",
  minHeight: 44,
  borderBottom: "1px solid #DDE1E6",
});

const CountryWrap = styled(Box)({
  minWidth: 120,
  display: "flex",
  alignItems: "center",
  gap: 8,
  paddingRight: 12,
  borderRight: "1px solid #DDE1E6",
  color: "#1E293B",
  fontSize: 16,
  fontWeight: 500,
});

const PhoneInput = styled(InputBase)({
  flex: 1,
  paddingLeft: 16,
  fontSize: 16,
});

const SectionTitle = styled(Typography)({
  fontSize: 14,
  fontWeight: 500,
  color: "#64748B",
  marginBottom: 12,
});

const UserRow = styled(ListItem)({
  paddingLeft: 0,
  paddingRight: 0,
});

const RowContent = styled(Box)({
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
});

const LeftUser = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
  flex: 1,
});

const SuggestText = styled(Typography)({
  fontSize: 13,
  color: "#64748B",
});

const FooterButton = styled(Button)({
  minWidth: 88,
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 4,
});

const normalizePhoneQuery = (input: string) => {
  const digits = input.replace(/\D/g, "");

  if (!digits) return "";

  if (digits.startsWith("84")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0")) {
    return `+84${digits.slice(1)}`;
  }

  return `+84${digits}`;
};

const isPhoneNumber = (input: string) => {
  const phoneRegex = /^[\d\s\-()+]*$/;
  const digitsOnly = input.replace(/\D/g, "");
  return phoneRegex.test(input) && digitsOnly.length >= 3;
};

export default function AddFriendDialog({
  open,
  onClose,
  suggestions = [],
  onSendFriendRequest,
  onCancelFriendRequest,
}: AddFriendDialogProps) {
  const t = useTrans();
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<IUserSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentUsers, setRecentUsers] = useState<IUserSearchItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUserSearchItem | null>(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState(
    "Xin chào, kết bạn với mình nhé!"
  );
  const [blockDiary, setBlockDiary] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  const friends = useFriendStore((s) => s.friends);
  const pendingRequests = useFriendStore((s) => s.pendingRequests);
  const sentRequests = useFriendStore((s) => s.sentRequests);

  const fetchFriends = useFriendStore((s) => s.fetchFriends);
  const fetchPendingRequests = useFriendStore((s) => s.fetchPendingRequests);
  const fetchSentRequests = useFriendStore((s) => s.fetchSentRequests);
  const getRelationStatus = useFriendStore((s) => s.getRelationStatus);
  const getOutgoingRequestByUserId = useFriendStore(
    (s) => s.getOutgoingRequestByUserId
  );

  const hasInput = searchValue.trim().length > 0;
  const displayUsers = hasInput
    ? results
    : recentUsers.length > 0
      ? recentUsers
      : suggestions;
  const showNotFound =
    hasInput && hasSearched && !loading && !error && results.length === 0;
  const debouncedSearch = useDebounce(searchValue, 500);

  const hasKeyword = debouncedSearch.trim().length > 0;
  const isPhoneSearch = useMemo(
    () => isPhoneNumber(debouncedSearch.trim()),
    [debouncedSearch]
  );

  useEffect(() => {
    if (!open) return;

    void Promise.all([
      fetchFriends(),
      fetchPendingRequests(),
      fetchSentRequests(),
    ]);
  }, [open, fetchFriends, fetchPendingRequests, fetchSentRequests]);

  const fetchUsers = async (rawKeyword: string) => {
    const keyword = rawKeyword.trim();

    if (!keyword) {
      setResults([]);
      setError(null);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    if (!isPhoneNumber(keyword)) {
      setResults([]);
      setError("Vui lòng nhập đúng số điện thoại");
      setLoading(false);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const q = normalizePhoneQuery(keyword);

      const response = await searchService.searchUsers({
        q,
        page: 1,
        limit: 20,
      });

      const users = Array.isArray(response?.payload?.data)
        ? response.payload.data
        : [];

      setResults(users);
      setHasSearched(true);

      if (users.length > 0) {
        setRecentUsers((prev) => {
          const merged = [...users, ...prev].filter(
            (user, index, arr) =>
              arr.findIndex((item) => item.id === user.id) === index
          );
          return merged.slice(0, 5);
        });
      }
    } catch (err: any) {
      console.error("search user error:", err);
      setError(err?.message || t("COMMON.SEARCH_ERROR"));
      setResults([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const keyword = debouncedSearch.trim();

    if (!keyword) {
      setResults([]);
      setError(null);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    if (!isPhoneSearch) {
      setResults([]);
      setError("Vui lòng nhập đúng số điện thoại");
      setLoading(false);
      setHasSearched(false);
      return;
    }

    void fetchUsers(keyword);
  }, [open, debouncedSearch, isPhoneSearch]);

  const updateUserInLists = (
    userId: string,
    updater: (item: IUserSearchItem) => IUserSearchItem
  ) => {
    setResults((prev) =>
      prev.map((item) => (item.id === userId ? updater(item) : item))
    );
    setRecentUsers((prev) =>
      prev.map((item) => (item.id === userId ? updater(item) : item))
    );
  };

  const handleClose = () => {
    setSearchValue("");
    setResults([]);
    setError(null);
    setLoading(false);
    setHasSearched(false);
    setSelectedUser(null);
    setOpenConfirmModal(false);
    onClose();
  };

  const handleManualSearch = async () => {
    await fetchUsers(searchValue);
  };

  const handleAddFriend = (user: IUserSearchItem) => {
    setSelectedUser(user);
    setRequestMessage("Xin chào, Kết bạn với mình nhé!");
    setBlockDiary(false);
    setOpenConfirmModal(true);
  };

  const handleCancelRequest = async (
    user: IUserSearchItem,
    requestId?: string
  ) => {
    try {
      if (!requestId) return;

      setSendingRequest(true);

      if (onCancelFriendRequest) {
        await onCancelFriendRequest({ user, requestId });
      } else {
        await friendService.cancelRequest(requestId);
      }

      await fetchSentRequests();

      updateUserInLists(user.id, (item) => ({
        ...item,
        friendshipStatus: "none",
      }));
    } catch (err) {
      console.error("cancel request error:", err);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleConfirmSendFriendRequest = async () => {
    if (!selectedUser) return;

    try {
      setSendingRequest(true);

      if (onSendFriendRequest) {
        await onSendFriendRequest({
          user: selectedUser,
          message: requestMessage.trim(),
        });
      } else {
        await friendService.sendRequest({
          message: requestMessage.trim(),
          userId: selectedUser.id,
        });
      }

      await fetchSentRequests();

      updateUserInLists(selectedUser.id, (item) => ({
        ...item,
        friendshipStatus: "pending_sent",
      }));

      setOpenConfirmModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("send friend request error:", err);
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <React.Fragment>
      <AppModal
        open={open}
        onClose={handleClose}
        title={t("FRIEND.ADD_TITLE")}
        maxWidth="xs"
        fullWidth
        headerDivider
        actions={
          <>
            <FooterButton
              variant="outlined"
              color="inherit"
              onClick={handleClose}
            >
              {t("COMMON.BACK")}
            </FooterButton>
            <FooterButton
              variant="contained"
              onClick={handleManualSearch}
              disabled={!searchValue.trim() || loading}
            >
              {t("FRIEND.SEARCH_RESULTS")}
            </FooterButton>
          </>
        }
      >
        <Box>
          <PhoneBar>
            <CountryWrap>
              <Box component="span" sx={{ fontSize: 22, lineHeight: 1 }}>
                🇻🇳
              </Box>
              <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
                (+84)
              </Typography>
              <KeyboardArrowDownIcon sx={{ color: "#64748B" }} />
            </CountryWrap>

            <PhoneInput
              placeholder={t("COMMON.SEARCH_PLACEHOLDER")}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </PhoneBar>

          <Box sx={{ pt: 3 }}>
            <SectionTitle>
              {hasInput ? t("FRIEND.SEARCH_RESULTS") : t("FRIEND.RECENT_RESULTS")}
            </SectionTitle>

            {loading ? (
              <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={22} />
              </Box>
            ) : error ? (
              <Typography sx={{ fontSize: 14, color: "error.main" }}>
                {error}
              </Typography>
            ) : displayUsers.length > 0 ? (
              <List disablePadding>
                {displayUsers.map((user) => {
                  const relationStatus = getRelationStatus(user.id);
                  const outgoingRequest = getOutgoingRequestByUserId(user.id);

                  const isOutgoing = relationStatus === "outgoing";
                  const isFriend = relationStatus === "friend";
                  const isIncoming = relationStatus === "incoming";

                  return (
                    <UserRow key={user.id} disableGutters>
                      <RowContent>
                        <LeftUser>
                          <Avatar src={user.avatarUrl ?? undefined}>
                            {user.fullName?.charAt(0)?.toUpperCase()}
                          </Avatar>

                          <ListItemText
                            primary={user.fullName}
                            secondary={hasInput ? user.phone : t("FRIEND.FROM_RECENT")}
                            slotProps={{
                              primary: {
                                fontSize: 16,
                                fontWeight: 500,
                                color: "#0F172A",
                              },
                              secondary: {
                                fontSize: 13,
                                color: "#64748B",
                              },
                            }}
                          />
                        </LeftUser>

                        {isFriend ? null : isIncoming ? (
                          <Button variant="text" disabled>
                            {t("FRIEND.ALREADY_ACCEPTED")}
                          </Button>
                        ) : (
                          <Button
                            variant={isOutgoing ? "text" : "outlined"}
                            disabled={sendingRequest}
                            onClick={() =>
                              isOutgoing
                                ? handleCancelRequest(user, outgoingRequest?.id)
                                : handleAddFriend(user)
                            }
                          >
                            {isOutgoing ? t("FRIEND.CANCEL_REQUEST") : t("FRIEND.ACCEPT")}
                          </Button>
                        )}
                      </RowContent>
                    </UserRow>
                  );
                })}
              </List>
            ) : showNotFound ? (
              <Typography sx={{ fontSize: 14, color: "#64748B" }}>
                {t("COMMON.SEARCH_ERROR")}
              </Typography>
            ) : null}

            {!hasKeyword && suggestions.length > 0 && (
              <SuggestText sx={{ mt: 2, cursor: "pointer", color: "#005AE0" }}>
                Xem thêm
              </SuggestText>
            )}
          </Box>
        </Box>
      </AppModal>

      <FriendRequestConfirmModal
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        user={selectedUser}
        message={requestMessage}
        onChangeMessage={setRequestMessage}
        onChangeBlockDiary={setBlockDiary}
        onConfirm={handleConfirmSendFriendRequest}
        loading={sendingRequest}
        onViewProfile={(user) => {
          // TODO: Implement view profile
        }}
      />
    </React.Fragment>
  );
}