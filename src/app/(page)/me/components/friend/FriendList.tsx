"use client";

import {
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
  onlineIds?: string[];
}

const FriendList: React.FC<FriendListProps> = ({
  friends = [],
  loading = false,
  onSearch = () => {},
  onRemoveFriend = () => {},
  onlineIds = [],
}) => {
  return (
    <Root>
      <Header>
        <HeaderTitle>Danh sách bạn bè</HeaderTitle>
      </Header>

      <Content>
        <SectionTitle>Bạn bè ({friends.length})</SectionTitle>

        <FilterWrap>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm bạn"
            value=""
            onChange={(e) => onSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </FilterWrap>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : friends.length === 0 ? (
          <ListCard>
            <CardContent>
              <EmptyWrap>
                <Typography>Chưa có bạn bè nào</Typography>
              </EmptyWrap>
            </CardContent>
          </ListCard>
        ) : (
          <Stack spacing={2}>
            {friends.map((friend) => (
              <ListCard key={friend.id}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ position: "relative" }}>
                      <Avatar src={friend.avatar} />
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: onlineIds.includes(friend.id) ? "#22C55E" : "#9CA3AF",
                          border: "2px solid #fff",
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                        }}
                      />
                    </Box>
                    <Box flex={1}>
                      <Typography fontWeight={600}>{friend.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {onlineIds.includes(friend.id) ? "Đang hoạt động" : "Không hoạt động"}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<PersonRemoveOutlinedIcon />}
                      onClick={() => onRemoveFriend(friend.id)}
                    >
                      Xóa
                    </Button>
                  </Stack>
                </CardContent>
              </ListCard>
            ))}
          </Stack>
        )}
      </Content>
    </Root>
  );
};

export default FriendList;
