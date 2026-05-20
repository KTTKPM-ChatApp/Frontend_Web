"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  IconButton,
  InputBase,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const Root = styled(Box)({
  background: "#fff",
  marginBottom: 8,
});

const Header = styled(Box)({
  minHeight: 56,
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
});

const HeaderLeft = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

const Title = styled(Typography)({
  fontSize: 16,
  fontWeight: 700,
  color: "#0F172A",
});

const Count = styled(Typography)({
  fontSize: 14,
  fontWeight: 400,
  color: "#64748B",
});

const ArrowButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ open }) => ({
  width: 28,
  height: 28,
  color: "#64748B",
  transform: open ? "rotate(180deg)" : "rotate(0deg)",
  transition: "transform 0.2s ease",
}));

const SearchWrap = styled(Box)({
  padding: "0 16px 12px",
});

const StyledSearch = styled(InputBase)({
  width: "100%",
  height: 36,
  padding: "0 12px",
  borderRadius: 8,
  background: "#F3F5F7",
  fontSize: 14,
  "& input::placeholder": {
    color: "#94A3B8",
  },
});

const MemberList = styled(Box)({
  padding: "0 16px 16px",
  display: "flex",
  flexDirection: "column",
  gap: 2,
});

const MemberRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "8px 10px",
  borderRadius: 8,
  "&:hover": {
    background: "#F8FAFC",
  },
});

const MemberAvatar = styled(Avatar)({
  width: 36,
  height: 36,
  fontSize: 14,
});

const MemberInfo = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const MemberName = styled(Typography)({
  fontSize: 14,
  fontWeight: 500,
  color: "#0F172A",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const AdminBadge = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  gap: 3,
  backgroundColor: "#FEF3C7",
  color: "#D97706",
  padding: "1px 7px",
  borderRadius: 10,
  fontSize: 11,
  fontWeight: 600,
  marginTop: 2,
});

const RemoveBtn = styled(IconButton)({
  width: 28,
  height: 28,
  color: "#94A3B8",
  "&:hover": {
    color: "#DC2626",
    background: "#FEE2E2",
  },
});

const ViewAllBtn = styled(Button)({
  height: 40,
  borderRadius: 8,
  background: "#F3F5F7",
  color: "#0F172A",
  fontSize: 14,
  fontWeight: 600,
  textTransform: "none",
  boxShadow: "none",
  margin: "0 16px 16px",
  "&:hover": {
    background: "#E5E7EB",
    boxShadow: "none",
  },
});

const AddMemberLine = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "8px 10px",
  borderRadius: 8,
  cursor: "pointer",
  color: "#005AE0",
  "&:hover": {
    background: "#EFF6FF",
  },
});

interface GroupMemberListViewProps {
  members?: Array<{
    id: string;
    name: string;
    avatar?: string;
    isAdmin?: boolean;
    phone?: string;
  }>;
  totalCount?: number;
  searchValue?: string;
  onSearch?: (value: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onAddMember?: () => void;
  onPromoteToAdmin?: (memberId: string) => void;
  onDemoteFromAdmin?: (memberId: string) => void;
}

const GroupMemberListView: React.FC<GroupMemberListViewProps> = ({
  members = [],
  totalCount = 0,
  searchValue = "",
  onSearch = () => {},
  onRemoveMember = () => {},
  onAddMember = () => {},
  onPromoteToAdmin = () => {},
  onDemoteFromAdmin = () => {},
}) => {
  const [open, setOpen] = useState(true);

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const showAll = searchValue || filteredMembers.length <= 5;
  const displayedMembers = showAll ? filteredMembers : filteredMembers.slice(0, 5);

  return (
    <Root>
      <Header onClick={() => setOpen((prev) => !prev)}>
        <HeaderLeft>
          <Title>Thành viên nhóm</Title>
          <Count>({totalCount})</Count>
        </HeaderLeft>
        <ArrowButton open={open}>
          <KeyboardArrowDownRoundedIcon />
        </ArrowButton>
      </Header>

      <Collapse in={open}>
        <SearchWrap>
          <StyledSearch
            placeholder="Tìm kiếm thành viên"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            startAdornment={
              <SearchIcon sx={{ fontSize: 18, color: "#94A3B8", mr: 1 }} />
            }
          />
        </SearchWrap>

        {filteredMembers.length === 0 ? (
          <Box p="0 16px 16px" textAlign="center" color="#94A3B8" fontSize={14}>
            {searchValue ? "Không tìm thấy" : "Chưa có thành viên"}
          </Box>
        ) : (
          <>
            <MemberList>
              {displayedMembers.map((member) => (
                <MemberRow key={member.id}>
                  <MemberAvatar src={member.avatar}>
                    {member.name.charAt(0).toUpperCase()}
                  </MemberAvatar>
                  <MemberInfo>
                    <MemberName>{member.name}</MemberName>
                    {member.isAdmin && (
                      <AdminBadge>
                        <AdminPanelSettingsIcon sx={{ fontSize: 13 }} />
                        Quản trị viên
                      </AdminBadge>
                    )}
                  </MemberInfo>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {!member.isAdmin && onPromoteToAdmin && (
                      <RemoveBtn
                        size="small"
                        onClick={() => onPromoteToAdmin(member.id)}
                        title="Phong quản trị viên"
                      >
                        <ArrowForwardIcon sx={{ fontSize: 18 }} />
                      </RemoveBtn>
                    )}
                    {member.isAdmin && onDemoteFromAdmin && (
                      <RemoveBtn
                        size="small"
                        onClick={() => onDemoteFromAdmin(member.id)}
                        title="Hạ quyền quản trị viên"
                      >
                        <ArrowForwardIcon sx={{ fontSize: 18, transform: "rotate(180deg)" }} />
                      </RemoveBtn>
                    )}
                    {!member.isAdmin && (
                      <RemoveBtn
                        size="small"
                        onClick={() => onRemoveMember(member.id)}
                      >
                        <PersonRemoveIcon sx={{ fontSize: 18 }} />
                      </RemoveBtn>
                    )}
                  </Box>
                </MemberRow>
              ))}
            </MemberList>

            {!showAll && (
              <ViewAllBtn fullWidth>
                Xem tất cả ({filteredMembers.length})
              </ViewAllBtn>
            )}
          </>
        )}

        <AddMemberLine onClick={onAddMember} sx={{ mx: 2, mb: 2 }}>
          <PersonAddAlt1RoundedIcon sx={{ fontSize: 20 }} />
          <Typography fontSize={14} fontWeight={500}>
            Thêm thành viên
          </Typography>
        </AddMemberLine>
      </Collapse>
    </Root>
  );
};

export default GroupMemberListView;
