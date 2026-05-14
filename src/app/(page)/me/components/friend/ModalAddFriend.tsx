"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress,
  InputBase,
  InputAdornment,
  Chip,
  Alert,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SendIcon from "@mui/icons-material/Send";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// ==================== STYLED COMPONENTS ====================

const PhoneBar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  minHeight: 44,
  borderBottom: "1px solid #DDE1E6",
  padding: "0 16px",
}));

const CountryWrap = styled(Box)(({ theme }) => ({
  minWidth: 120,
  display: "flex",
  alignItems: "center",
  gap: 8,
  paddingRight: 12,
  borderRight: "1px solid #DDE1E6",
  color: "#1E293B",
  fontSize: 16,
  fontWeight: 500,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#F8FAFC",
  },
}));

const PhoneInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  paddingLeft: 16,
  fontSize: 16,
  "& input": {
    "&::placeholder": {
      color: "#94A3B8",
    },
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: "#64748B",
  marginBottom: 12,
}));

const UserRow = styled(ListItem)(({ theme }) => ({
  paddingLeft: 0,
  paddingRight: 0,
  borderRadius: 8,
  marginBottom: 8,
  "&:hover": {
    backgroundColor: "#F8FAFC",
  },
}));

const RowContent = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
}));

const LeftUser = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
  flex: 1,
}));

const SuggestText = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  color: "#64748B",
}));

const FooterButton = styled(Button)(({ theme }) => ({
  minWidth: 88,
  textTransform: "none",
  fontSize: 14,
  fontWeight: 500,
}));

const FriendCard = styled(Card)(({ theme }) => ({
  marginBottom: 12,
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transform: "translateY(-2px)",
    transition: "all 0.2s ease",
  },
}));

const FriendCardContent = styled(CardContent)(({ theme }) => ({
  padding: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
}));

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
  onSearch?: (value: string) => void;
  onSendRequest?: (userId: string) => void;
}

const ModalAddFriend: React.FC<ModalAddFriendProps> = ({
  open,
  onClose,
  onSearch = () => {},
  onSendRequest = () => {},
}) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+84");

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    
    setLoading(true);
    try {
      onSearch(searchValue);
      // Mock results with friendship status
      setTimeout(() => {
        setResults([
          { 
            id: "1", 
            name: "Nguyễn Văn A", 
            phone: "0987654321",
            avatar: "/avatar1.jpg",
            friendshipStatus: "none"
          },
          { 
            id: "2", 
            name: "Trần Thị B", 
            phone: "0123456789",
            avatar: "/avatar2.jpg",
            friendshipStatus: "friend"
          },
          { 
            id: "3", 
            name: "Lê Văn C", 
            phone: "0912345678",
            avatar: "/avatar3.jpg",
            friendshipStatus: "incoming"
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Search error:", error);
      setLoading(false);
    }
  };

  const handleAddFriend = (user: User) => {
    onSendRequest(user.id);
    // Update local status
    setResults(prev => prev.map(item => 
      item.id === user.id 
        ? { ...item, friendshipStatus: "pending_sent" as const }
        : item
    ));
  };

  const getStatusChip = (status?: string) => {
    switch (status) {
      case "friend":
        return <Chip label={t("FRIEND.STATUS_FRIEND")} color="success" size="small" />;
      case "incoming":
        return <Chip label={t("FRIEND.STATUS_INCOMING")} color="info" size="small" />;
      case "outgoing":
      case "pending_sent":
        return <Chip label={t("FRIEND.STATUS_OUTGOING")} color="warning" size="small" />;
      default:
        return null;
    }
  };

  const getActionButton = (user: User) => {
    switch (user.friendshipStatus) {
      case "friend":
        return (
          <Button variant="outlined" size="small" disabled>
            {t("FRIEND.ALREADY_FRIEND")}
          </Button>
        );
      case "incoming":
        return (
          <Button variant="contained" size="small" color="success">
            {t("FRIEND.ACCEPT")}
          </Button>
        );
      case "outgoing":
      case "pending_sent":
        return (
          <Button variant="outlined" size="small" disabled>
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
          >
            {t("FRIEND.ADD_FRIEND")}
          </Button>
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>{t("FRIEND.ADD_FRIEND_TITLE")}</DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        {/* Phone Search Bar */}
        <PhoneBar>
          <CountryWrap>
            🇻🇳 {countryCode}
          </CountryWrap>
          <PhoneInput
            placeholder={t("FRIEND.SEARCH_PLACEHOLDER")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </PhoneBar>

        {/* Search Results */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : results.length > 0 ? (
          <Box sx={{ mt: 2 }}>
            <SectionTitle>Kết quả tìm kiếm</SectionTitle>
            {results.map((user) => (
              <FriendCard key={user.id}>
                <FriendCardContent>
                  <LeftUser>
                    <Avatar src={user.avatar} sx={{ width: 48, height: 48 }}>
                      {user.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={500} variant="body1">
                        {user.name}
                      </Typography>
                      {user.phone && (
                        <SuggestText>{user.phone}</SuggestText>
                      )}
                      {getStatusChip(user.friendshipStatus)}
                    </Box>
                  </LeftUser>
                  {getActionButton(user)}
                </FriendCardContent>
              </FriendCard>
            ))}
          </Box>
        ) : searchValue ? (
          <Box display="flex" flexDirection="column" alignItems="center" p={3}>
            <PersonAddIcon sx={{ fontSize: 48, color: "#94A3B8", mb: 2 }} />
            <Typography color="textSecondary" align="center">
              {t("FRIEND.NO_RESULTS")}
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" mt={1}>
              {t("FRIEND.TRY_DIFFERENT_INFO")}
            </Typography>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" p={3}>
            <SearchIcon sx={{ fontSize: 48, color: "#94A3B8", mb: 2 }} />
            <Typography color="textSecondary" align="center">
              {t("FRIEND.SEARCH_FRIENDS")}
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" mt={1}>
              {t("FRIEND.ENTER_PHONE_OR_NAME")}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <FooterButton onClick={onClose}>
          {t("COMMON.CLOSE")}
        </FooterButton>
      </DialogActions>
    </Dialog>
  );
};

export default ModalAddFriend;
