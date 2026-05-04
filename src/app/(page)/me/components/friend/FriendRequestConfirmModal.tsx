"use client";

import {
    Avatar,
    Box,
    Button,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AppModal from "@/src/shared/component/AppModal";
import { IUserSearchItem } from "@/src/common/interface/search-interface";
import { useTrans } from "@/src/common/utilities/hook/trans";

interface FriendRequestConfirmModalProps {
    open: boolean;
    onClose: () => void;
    user: IUserSearchItem | null;
    message: string;
    onChangeMessage: (value: string) => void;
    // blockDiary: boolean;
    onChangeBlockDiary: (checked: boolean) => void;
    onConfirm: () => Promise<void> | void;
    loading?: boolean;
    onViewProfile?: (user: IUserSearchItem) => void;
}

const Banner = styled(Box)({
    height: 180,
    width: "100%",
    background:
        "linear-gradient(135deg, #DCEBFF 0%, #F8E7D8 50%, #E8F1D4 100%)",
    overflow: "hidden",
});

const UserInfoWrap = styled(Box)({
    position: "relative",
    padding: "0 20px 20px",
});

const AvatarWrap = styled(Box)({
    marginTop: -42,
    display: "flex",
    alignItems: "center",
    gap: 16,
});

const StyledAvatar = styled(Avatar)({
    width: 84,
    height: 84,
    border: "4px solid #fff",
});

const NameWrap = styled(Box)({
    display: "flex",
    alignItems: "center",
    gap: 8,
});

const MessageWrap = styled(Box)({
    marginTop: 20,
});

const OptionWrap = styled(Box)({
    marginTop: 20,
    minHeight: 52,
    borderRadius: 4,
    background: "#F3F4F6",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
});

const FooterButton = styled(Button)({
    minWidth: 110,
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 4,
});

export default function FriendRequestConfirmModal({
    open,
    onClose,
    user,
    message,
    onChangeMessage,
    // blockDiary,
    onChangeBlockDiary,
    onConfirm,
    loading = false,
    onViewProfile,
}: FriendRequestConfirmModalProps) {
    const t = useTrans();
    return (
        <AppModal
            open={open}
            onClose={onClose}
            title={t("PROFILE.TITLE")}
            maxWidth="xs"
            fullWidth
            headerDivider
            actions={
                <>
                    {/* <FooterButton
                        variant="outlined"
                        color="inherit"
                        disabled={!user}
                        onClick={() => user && onViewProfile?.(user)}
                    >
                        Thông tin
                    </FooterButton> */}

                    <FooterButton
                        variant="contained"
                        onClick={onConfirm}
                        disabled={!user || loading}
                    >
                        {t("FRIEND.ACCEPT")}
                    </FooterButton>
                </>
            }
        >
            <Box>
                <Banner />

                <UserInfoWrap>
                    <AvatarWrap>
                        <StyledAvatar src={user?.avatarUrl ?? undefined}>
                            {user?.fullName?.charAt(0)?.toUpperCase()}
                        </StyledAvatar>

                        <NameWrap>
                            <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>
                                {user?.fullName || ""}
                            </Typography>
                            {/* <EditOutlinedIcon sx={{ fontSize: 18, color: "#475569" }} /> */}
                        </NameWrap>
                    </AvatarWrap>

                    <MessageWrap>
                        <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            value={message}
                            onChange={(e) => onChangeMessage(e.target.value.slice(0, 150))}
                            helperText={`${message.length}/150 ${t("COMMON.CHARACTERS") || "characters"}`}
                        />
                    </MessageWrap>

                    {/* <OptionWrap>
                        <Typography sx={{ fontSize: 14, color: "#0F172A" }}>
                            Chặn người này xem nhật ký của tôi
                        </Typography>
                        <Switch
                            checked={blockDiary}
                            onChange={(e) => onChangeBlockDiary(e.target.checked)}
                        />
                    </OptionWrap> */}
                </UserInfoWrap>
            </Box>
        </AppModal>
    );
}