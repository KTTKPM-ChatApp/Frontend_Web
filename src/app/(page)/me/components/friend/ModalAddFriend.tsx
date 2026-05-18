"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { searchService } from "@/src/common/service/search-service";
import { friendService } from "@/src/common/service/friend-service";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  InputBase,
  List,
  ListItem,
  Avatar,
  CircularProgress,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useDebounce } from "@/src/common/utilities/hook/debounce";

interface User {
  id: string;
  name: string;
  phone?: string;
  avatar?: string;
  friendshipStatus?: "none" | "friend" | "incoming" | "outgoing" | "pending_sent";
}

interface ModalAddFriendProps {
  open: boolean;
  onClose: () => void;
}

const SearchBarWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  minHeight: 54,
  border: "1px solid #E2E8F0",
  borderRadius: 16,
  padding: "0 14px",
  background: "#F8FAFC",
  transition: "all .2s ease",

  "&:focus-within": {
    borderColor: "#0068FF",
    background: "#FFFFFF",
    boxShadow: "0 0 0 3px rgba(0,104,255,0.12)",
  },
});

const SearchInput = styled(TextField)({
  flex: 1,

  "& .MuiInputBase-root": {
    background: "transparent",
  },

  "& .MuiInputBase-input": {
    padding: "12px 10px",
    fontSize: 15,
    fontWeight: 500,
  },

  "& .MuiInput-underline:before": {
    borderBottom: "none",
  },

  "& .MuiInput-underline:after": {
    borderBottom: "none",
  },

  "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
    borderBottom: "none",
  },
});

const CloseBtn = styled(IconButton)({
  width: 32,
  height: 32,
  borderRadius: 10,

  "&:hover": {
    background: "#EEF2FF",
  },
});

const SearchResultsContainer = styled(Box)({
  marginTop: 14,
  borderRadius: 18,
  overflow: "hidden",
  border: "1px solid #E2E8F0",
  background: "#FFFFFF",
  maxHeight: 420,
  overflowY: "auto",
});

const SearchResultItem = styled(ListItem)({
  padding: "14px 16px",
  transition: "all .15s ease",
  borderBottom: "1px solid #F1F5F9",

  "&:hover": {
    background: "#F8FAFC",
  },
});

const EmptyState = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "56px 24px",
  color: "#64748B",
});

const SectionTitle = styled(Typography)({
  fontSize: 13,
  fontWeight: 700,
  color: "#64748B",
  padding: "14px 16px 10px",
  background: "#FFFFFF",
  position: "sticky",
  top: 0,
  zIndex: 2,
});

const FooterButton = styled(Button)({
  minWidth: 90,
  textTransform: "none",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 12,
});

export default function AddFriendDialog({
  open,
  onClose,
}) => {
  const { t } = useTranslation();

  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<IUserSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const debouncedSearch = useDebounce(searchValue, 300);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchUsers = async () => {
      const keyword = debouncedSearch.trim();

      if (!keyword) {
        setResults([]);
        setSearchError(null);
        return;
      }

      try {
        setLoading(true);
        setSearchError(null);

        const res = await searchService.searchUsers({
          q: keyword,
        });

        const rawData: any[] = res?.payload?.data ?? [];

        setResults(
          rawData.map((u: any) => ({
            id: u.id,
            name: u.displayName,
            phone: u.phone || "",
            avatar: u.avatarUrl || undefined,
            friendshipStatus: u.friendshipStatus || "none",
          }))
        );
      } catch (error: any) {
        console.error("Search error:", error);

        setSearchError(
          error?.message || "Không thể tìm kiếm người dùng"
        );

        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [open]);

  const handleClose = () => {
    setSearchValue("");
    setResults([]);
    setShowResults(false);
    setSearchError(null);

    onClose();
  };

  const handleAddFriend = async (user: User) => {
    try {
      await friendService.sendRequest(user.id);

      setResults((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                friendshipStatus: "outgoing",
              }
            : item
        )
      );
    } catch (err: any) {
      console.error("Failed to send request:", err);
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    try {
      await friendService.sendRequest(userId);

      setResults((prev) =>
        prev.map((item) =>
          item.id === userId
            ? {
                ...item,
                friendshipStatus: "friend",
              }
            : item
        )
      );
    } catch (err: any) {
      console.error("Failed to accept request:", err);
    }
  };

  const getStatusChip = (status?: string) => {
    switch (status) {
      case "friend":
        return (
          <Chip
            label={t("FRIEND.STATUS_FRIEND")}
            size="small"
            color="success"
            sx={{
              borderRadius: "8px",
              fontWeight: 600,
            }}
          />
        );

      case "incoming":
        return (
          <Chip
            label={t("FRIEND.STATUS_INCOMING")}
            size="small"
            color="info"
            sx={{
              borderRadius: "8px",
              fontWeight: 600,
            }}
          />
        );

      case "outgoing":
      case "pending_sent":
        return (
          <Chip
            label={t("FRIEND.STATUS_OUTGOING")}
            size="small"
            color="warning"
            sx={{
              borderRadius: "8px",
              fontWeight: 600,
            }}
          />
        );

      default:
        return null;
    }
  };

  const getActionButton = (user: User) => {
    switch (user.friendshipStatus) {
      case "friend":
        return (
          <Button
            variant="outlined"
            size="small"
            disabled
            sx={{
              borderRadius: "10px",
              textTransform: "none",
            }}
          >
            {t("FRIEND.ALREADY_FRIEND")}
          </Button>
        );

      case "incoming":
        return (
          <Button
            variant="contained"
            size="small"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleAcceptRequest(user.id)}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              boxShadow: "none",
            }}
          >
            {t("FRIEND.ACCEPT")}
          </Button>
        );

      case "outgoing":
      case "pending_sent":
        return (
          <Button
            variant="outlined"
            size="small"
            disabled
            sx={{
              borderRadius: "10px",
              textTransform: "none",
            }}
          >
            {t("FRIEND.REQUEST_SENT")}
          </Button>
        );

      default:
        return (
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={() => handleAddFriend(user)}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              boxShadow: "none",
              px: 1.5,
            }}
          >
            {t("FRIEND.ADD_FRIEND")}
          </Button>
        );
    }
  };

  const renderContent = () => {
    if (!searchValue.trim()) {
      return (
        <EmptyState>
          <SearchIcon
            sx={{
              fontSize: 52,
              color: "#94A3B8",
              mb: 2,
            }}
          />

          <Typography
            fontWeight={600}
            color="textPrimary"
            align="center"
          >
            {t("FRIEND.SEARCH_FRIENDS")}
          </Typography>

          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            mt={1}
          >
            {t("FRIEND.ENTER_PHONE_OR_NAME")}
          </Typography>
        </EmptyState>
      );
    }

    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          p={5}
        >
          <CircularProgress size={26} />
        </Box>
      );
    }

    if (searchError) {
      return (
        <EmptyState>
          <Typography color="error">
            {searchError}
          </Typography>
        </EmptyState>
      );
    }

    if (results.length === 0) {
      return (
        <EmptyState>
          <PersonAddAltOutlinedIcon
            sx={{
              fontSize: 52,
              color: "#94A3B8",
              mb: 2,
            }}
          />

          <Typography
            fontWeight={600}
            color="textPrimary"
            align="center"
          >
            {t("FRIEND.NO_RESULTS")}
          </Typography>

          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            mt={1}
          >
            {t("FRIEND.TRY_DIFFERENT_INFO")}
          </Typography>
        </EmptyState>
      );
    }

    return (
      <List sx={{ py: 0 }}>
        <SectionTitle>
          {t("FRIEND.SEARCH_RESULTS")}
        </SectionTitle>

        {results.map((user) => (
          <SearchResultItem key={user.id}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Avatar
                  src={user.avatar}
                  sx={{
                    width: 48,
                    height: 48,
                    fontWeight: 700,
                  }}
                >
                  {user.name.charAt(0)}
                </Avatar>

                <Box
                  sx={{
                    minWidth: 0,
                  }}
                >
                  <Typography
                    fontWeight={600}
                    variant="body2"
                    noWrap
                  >
                    {user.name}
                  </Typography>

                  {user.phone && (
                    <Typography
                      variant="caption"
                      color="textSecondary"
                    >
                      {user.phone}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexShrink: 0,
                }}
              >
                {getStatusChip(user.friendshipStatus)}

                {getActionButton(user)}
              </Box>
            </Box>
          </SearchResultItem>
        ))}
      </List>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: {
            xs: 0,
            sm: "24px",
          },
          width: {
            xs: "100%",
            sm: 560,
          },
          margin: {
            xs: 0,
            sm: 2,
          },
          height: {
            xs: "100%",
            sm: "auto",
          },
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 20,
          pb: 1,
        }}
      >
        {t("FRIEND.ADD_FRIEND_TITLE")}
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          pt: 3,
          pb: 2,
        }}
      >
        <Box ref={searchRef}>
          <SearchBarWrapper>
            <SearchIcon
              sx={{
                fontSize: 20,
                color: "#64748B",
                mr: 1,
              }}
            />

            <SearchInput
              placeholder={t("FRIEND.SEARCH_FRIENDS")}
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowResults(false);
                }
              }}
              variant="standard"
              autoFocus
            />

            {searchValue && (
              <CloseBtn
                size="small"
                onClick={() => {
                  setSearchValue("");
                  setResults([]);
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </CloseBtn>
            )}
          </SearchBarWrapper>

          {showResults && (
            <SearchResultsContainer>
              {renderContent()}
            </SearchResultsContainer>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
        }}
      >
        <FooterButton onClick={handleClose}>
          {t("COMMON.CLOSE")}
        </FooterButton>
      </DialogActions>
    </Dialog>
  );
};

export default ModalAddFriend;
