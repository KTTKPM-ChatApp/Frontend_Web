"use client";

import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const Content = styled(Box)({
  minHeight: 400,
  maxHeight: 500,
});

const SearchField = styled(TextField)({
  marginBottom: 16,
});

const MemberList = styled(List)({
  maxHeight: 350,
  overflowY: "auto",
});

const MemberItem = styled(ListItem)({
  borderRadius: 8,
  marginBottom: 4,
  "&:hover": {
    backgroundColor: "#F3F4F6",
  },
});

const AddButton = styled(Button)({
  minWidth: 100,
});

interface AddMemberGroupDialogProps {
  open: boolean;
  searchValue?: string;
  availableMembers?: Array<{
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
  }>;
  onClose?: () => void;
  onSearch?: (value: string) => void;
  onAddMember?: (memberId: string) => void;
}

const AddMemberGroupDialog: React.FC<AddMemberGroupDialogProps> = ({
  open,
  searchValue = "",
  availableMembers = [],
  onClose = () => {},
  onSearch = () => {},
  onAddMember = () => {},
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("GROUP.ADD_MEMBER_TITLE")}</DialogTitle>
      <DialogContent>
        <Content>
          <SearchField
            fullWidth
            size="small"
            placeholder={t("GROUP.SEARCH_MEMBERS")}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
          />

          <MemberList>
            {availableMembers.map((member) => (
              <MemberItem key={member.id}>
                <ListItemAvatar>
                  <Avatar src={member.avatar}>
                    {member.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.name}
                  secondary={member.phone}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: 15,
                  }}
                  secondaryTypographyProps={{
                    fontSize: 13,
                    color: "text.secondary",
                  }}
                />
                <AddButton
                  size="small"
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={() => onAddMember(member.id)}
                >
                  {t("COMMON.ADD")}
                </AddButton>
              </MemberItem>
            ))}
          </MemberList>

          {availableMembers.length === 0 && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height={200}
              color="text.secondary"
            >
              <Typography>{t("GROUP.NO_MEMBERS_FOUND")}</Typography>
            </Box>
          )}
        </Content>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("COMMON.CLOSE")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberGroupDialog;
