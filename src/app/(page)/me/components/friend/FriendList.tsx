"use client";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputBase,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

const Root = styled(Box)({
  height: "100%",
  background: "#F7F7F8",
  display: "flex",
  flexDirection: "column",
});

const Header = styled(Box)({
  height: 70,
  background: "#FFFFFF",
  borderBottom: "1px solid #E5E7EB",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 20px",
});

const HeaderTitle = styled(Typography)({
  fontSize: 20,
  fontWeight: 600,
  color: "#000000",
});

const Content = styled(Box)({
  flex: 1,
  padding: 20,
  overflowY: "auto",
});

const SearchWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  height: 42,
  borderRadius: 10,
  background: "#F7F7F8",
  padding: "0 14px",
  marginBottom: 20,
  border: "1px solid transparent",
  transition: "all 0.2s ease",
  "&:focus-within": {
    borderColor: "#0068FF",
    background: "#FFFFFF",
  },
});

const StyledSearch = styled(InputBase)({
  flex: 1,
  marginLeft: 8,
  fontSize: 14,
  color: "#081B3A",
  "& input::placeholder": {
    color: "#86909C",
    opacity: 1,
  },
});

const FriendCard = styled(Card)({
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  boxShadow: "none",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#0068FF",
    boxShadow: "0 4px 12px rgba(0, 104, 255, 0.15)",
  },
});

const FriendAvatar = styled(Avatar)({
  width: 48,
  height: 48,
  backgroundColor: "#0068FF",
  fontSize: 16,
  fontWeight: 600,
});

const FriendName = styled(Typography)({
  fontSize: 14,
  fontWeight: 600,
  color: "#000000",
});

const FriendStatus = styled(Typography)({
  fontSize: 13,
  color: "#767A7F",
});

const EmptyState = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: 300,
  color: "#767A7F",
});

const EmptyIcon = styled(Box)({
  width: 80,
  height: 80,
  borderRadius: "50%",
  background: "#F7F7F8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
});

const EmptyText = styled(Typography)({
  fontSize: 15,
  fontWeight: 600,
  color: "#000000",
  marginBottom: 4,
});

const EmptySubtext = styled(Typography)({
  fontSize: 13,
  color: "#767A7F",
});

const RemoveButton = styled(Button)({
  height: 32,
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  textTransform: "none",
  color: "#DB0000",
  border: "1px solid #FEE2E2",
  background: "#FEF2F2",
  padding: "0 12px",
  "&:hover": {
    background: "#FEE2E2",
    borderColor: "#FECACA",
  },
});

const OnlineBadge = styled(Box)({
  width: 12,
  height: 12,
  borderRadius: "50%",
  backgroundColor: "#22C55E",
  border: "2px solid #fff",
});

const OfflineBadge = styled(Box)({
  width: 12,
  height: 12,
  borderRadius: "50%",
  backgroundColor: "#9CA3AF",
  border: "2px solid #fff",
});

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status?: string;
}

interface FriendListProps {
  friends?: Friend[];
  loading?: boolean;
  onSearch?: (value: string) => void;
  onRemoveFriend?: (friendId: string) => void;
  onFriendClick?: (friendId: string) => void;
  onlineIds?: string[];
}

const FriendList: React.FC<FriendListProps> = ({
  friends = [],
  loading = false,
  onSearch = () => {},
  onRemoveFriend = () => {},
  onFriendClick,
  onlineIds = [],
}) => {
  return (
    <Root>
      <Header>
        <HeaderTitle>Danh sách bạn bè</HeaderTitle>
      </Header>

      <Content>
        <SearchWrapper>
          <SearchIcon sx={{ fontSize: 20, color: "#86909C" }} />
          <StyledSearch
            placeholder="Tìm bạn bè"
            onChange={(e) => onSearch(e.target.value)}
          />
        </SearchWrapper>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : friends.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <PeopleAltIcon sx={{ fontSize: 36, color: "#767A7F" }} />
            </EmptyIcon>
            <EmptyText>Chưa có bạn bè nào</EmptyText>
            <EmptySubtext>Kết bạn để bắt đầu trò chuyện</EmptySubtext>
          </EmptyState>
        ) : (
          <Stack spacing={1.5}>
            {friends.map((friend) => (
              <FriendCard key={friend.id} onClick={() => onFriendClick?.(friend.id)} sx={{ cursor: onFriendClick ? "pointer" : "default" }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ position: "relative" }}>
                      <FriendAvatar src={friend.avatar}>
                        {friend.name.charAt(0).toUpperCase()}
                      </FriendAvatar>
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: -2,
                          right: -2,
                        }}
                      >
                        {onlineIds.includes(friend.id) ? (
                          <OnlineBadge />
                        ) : (
                          <OfflineBadge />
                        )}
                      </Box>
                    </Box>
                    <Box flex={1} minWidth={0}>
                      <FriendName>{friend.name}</FriendName>
                      <FriendStatus>
                        {onlineIds.includes(friend.id)
                          ? "Đang hoạt động"
                          : "Không hoạt động"}
                      </FriendStatus>
                    </Box>
                    <RemoveButton
                      size="small"
                      startIcon={
                        <PersonRemoveOutlinedIcon sx={{ fontSize: 16 }} />
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFriend(friend.id);
                      }}
                    >
                      Xóa
                    </RemoveButton>
                  </Stack>
                </CardContent>
              </FriendCard>
            ))}
          </Stack>
        )}
      </Content>
    </Root>
  );
};

export default FriendList;