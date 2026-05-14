"use client";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

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

const SearchContainer = styled(Box)({
  marginBottom: 20,
});

const MemberCard = styled(Card)({
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  boxShadow: "none",
  marginBottom: 12,
});

const MemberAvatar = styled(Avatar)({
  width: 48,
  height: 48,
});

const AdminBadge = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 4,
  backgroundColor: "#FEF3C7",
  color: "#D97706",
  padding: "2px 8px",
  borderRadius: 12,
  fontSize: 12,
  fontWeight: 600,
});

interface GroupMemberListViewProps {
  members?: Array<{
    id: string;
    name: string;
    avatar?: string;
    isAdmin?: boolean;
    phone?: string;
  }>;
  searchValue?: string;
  onSearch?: (value: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onAddMember?: () => void;
}

const GroupMemberListView: React.FC<GroupMemberListViewProps> = ({
  members = [],
  searchValue = "",
  onSearch = () => {},
  onRemoveMember = () => {},
  onAddMember = () => {},
}) => {
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Root>
      <Header>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <HeaderTitle>Thành viên nhóm ({members.length})</HeaderTitle>
          <Button
            variant="contained"
            onClick={onAddMember}
          >
            Thêm thành viên
          </Button>
        </Box>
      </Header>

      <Content>
        <SearchContainer>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm thành viên"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
          />
        </SearchContainer>

        {filteredMembers.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height={200}
            color="text.secondary"
          >
            <Typography>
              {searchValue ? "Không tìm thấy thành viên nào" : "Chưa có thành viên nào"}
            </Typography>
          </Box>
        ) : (
          filteredMembers.map((member) => (
            <MemberCard key={member.id}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={3}>
                  <MemberAvatar src={member.avatar}>
                    {member.name.charAt(0).toUpperCase()}
                  </MemberAvatar>
                  
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Typography variant="h6" fontWeight={600}>
                        {member.name}
                      </Typography>
                      {member.isAdmin && (
                        <AdminBadge>
                          <AdminPanelSettingsIcon fontSize="small" />
                          Quản trị viên
                        </AdminBadge>
                      )}
                    </Box>
                    {member.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {member.phone}
                      </Typography>
                    )}
                  </Box>

                  {!member.isAdmin && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<PersonRemoveIcon />}
                      onClick={() => onRemoveMember(member.id)}
                    >
                      Xóa
                    </Button>
                  )}
                </Box>
              </CardContent>
            </MemberCard>
          ))
        )}
      </Content>
    </Root>
  );
};

export default GroupMemberListView;
