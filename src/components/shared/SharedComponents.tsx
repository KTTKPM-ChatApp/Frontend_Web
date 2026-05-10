// SHARED COMPONENTS - UI ONLY (No Logic/Handlers)
// =============================================

// AVATAR COMPONENT
// ================
import { Box } from "@mui/material";
import MuiAvatar, { AvatarProps } from "@mui/material/Avatar";
import { styled } from "@mui/material/styles";

interface AppAvatarProps extends Omit<AvatarProps, "src"> {
  src?: string | null;
  name?: string | null;
  size?: number;
  fontSize?: number;
  showNameFallback?: boolean;
  isGroup?: boolean;
  memberAvatarUrls?: (string | null | undefined)[];
}

// Styled Components for Avatar
const GroupClusterWrap = styled(Box)({
  position: "relative",
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  overflow: "hidden",
  background: "#FFFFFF",
});

const MiniAvatar = styled("img")({
  position: "absolute",
  objectFit: "cover",
  borderRadius: "50%",
  border: "1.5px solid #fff",
  background: "#D1D5DB",
  display: "block",
});

const CountBadge = styled(Box)({
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "#E2E8F0",
  color: "#475569",
  fontWeight: 700,
  border: "1.5px solid #fff",
});

// Avatar Component UI Structure
export const AvatarUI = {
  // Single Avatar with image
  withImage: (
    <MuiAvatar
      src="/avatar.jpg"
      alt="User Avatar"
      sx={{
        width: 40,
        height: 40,
        fontSize: 16,
        fontWeight: 700,
      }}
    />
  ),

  // Avatar with name fallback
  withNameFallback: (
    <MuiAvatar
      sx={{
        width: 40,
        height: 40,
        fontSize: 16,
        fontWeight: 700,
      }}
    >
      JD
    </MuiAvatar>
  ),

  // Group Avatar with multiple members (2 members)
  groupAvatar2: (
    <MuiAvatar
      sx={{
        width: 40,
        height: 40,
        background: "#fff",
        p: 0,
      }}
    >
      <GroupClusterWrap>
        <MiniAvatar
          src="/avatar1.jpg"
          alt=""
          style={{
            width: 25,
            height: 25,
            left: 2.4,
            top: 7.2,
            zIndex: 2,
          }}
        />
        <MiniAvatar
          src="/avatar2.jpg"
          alt=""
          style={{
            width: 25,
            height: 25,
            right: 2.4,
            bottom: 7.2,
            zIndex: 1,
          }}
        />
      </GroupClusterWrap>
    </MuiAvatar>
  ),

  // Group Avatar with multiple members (3 members)
  groupAvatar3: (
    <MuiAvatar
      sx={{
        width: 40,
        height: 40,
        background: "#fff",
        p: 0,
      }}
    >
      <GroupClusterWrap>
        <MiniAvatar
          src="/avatar1.jpg"
          alt=""
          style={{
            width: 20,
            height: 20,
            left: 3.2,
            top: 3.2,
            zIndex: 3,
          }}
        />
        <MiniAvatar
          src="/avatar2.jpg"
          alt=""
          style={{
            width: 20,
            height: 20,
            right: 3.2,
            top: 3.2,
            zIndex: 2,
          }}
        />
        <MiniAvatar
          src="/avatar3.jpg"
          alt=""
          style={{
            width: 20,
            height: 20,
            left: "50%",
            bottom: 2.4,
            transform: "translateX(-50%)",
            zIndex: 1,
          }}
        />
      </GroupClusterWrap>
    </MuiAvatar>
  ),

  // Group Avatar with multiple members (4+ members)
  groupAvatar4Plus: (
    <MuiAvatar
      sx={{
        width: 40,
        height: 40,
        background: "#fff",
        p: 0,
      }}
    >
      <GroupClusterWrap>
        <MiniAvatar
          src="/avatar1.jpg"
          alt=""
          style={{
            width: 18.4,
            height: 18.4,
            left: 2,
            top: 4,
            zIndex: 4,
          }}
        />
        <MiniAvatar
          src="/avatar2.jpg"
          alt=""
          style={{
            width: 18.4,
            height: 18.4,
            right: 2,
            top: 2,
            zIndex: 3,
          }}
        />
        <MiniAvatar
          src="/avatar3.jpg"
          alt=""
          style={{
            width: 18.4,
            height: 18.4,
            left: 3.2,
            bottom: 2,
            zIndex: 2,
          }}
        />
        <CountBadge
          sx={{
            width: 18.4,
            height: 18.4,
            right: 2,
            bottom: 3.2,
            fontSize: 9,
            zIndex: 1,
          }}
        >
          +2
        </CountBadge>
      </GroupClusterWrap>
    </MuiAvatar>
  ),

  // Default group avatar (no images)
  defaultGroup: (
    <MuiAvatar
      sx={{
        width: 40,
        height: 40,
        fontWeight: 700,
        background: "#D1D5DB",
        color: "#475569",
      }}
    >
      G
    </MuiAvatar>
  )
};

// BOX ICON COMPONENT
// ==================
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

interface BoxIconProps {
    outlined: React.ElementType;
    filled: React.ElementType;
    selected?: boolean;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

// Styled Components for BoxIcon
const StyledBoxIcon = styled(Box, {
    shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ selected }) => ({
    borderRadius: "8px",
    minHeight: "48px",
    minWidth: "48px",
    backgroundColor: selected ? "rgba(0, 0, 0, 0.25)" : "transparent",
    transition: "all 0.2s ease",
    "&:hover": {
        backgroundColor: "#00000026",
        cursor: "pointer",
    },
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}));

// BoxIcon Component UI Structure
export const BoxIconUI = {
  // Unselected state
  unselected: (
    <StyledBoxIcon selected={false} onClick={() => {}}>
      {/* Placeholder icon - would be replaced with actual icon component */}
      <Box sx={{
        color: "#fff",
        fontSize: 28,
        width: 28,
        height: 28,
        backgroundColor: "#666",
        borderRadius: 4,
      }} />
    </StyledBoxIcon>
  ),

  // Selected state
  selected: (
    <StyledBoxIcon selected={true} onClick={() => {}}>
      {/* Placeholder icon - would be replaced with actual icon component */}
      <Box sx={{
        color: "#fff",
        fontSize: 28,
        width: 28,
        height: 28,
        backgroundColor: "#0068FF",
        borderRadius: 4,
      }} />
    </StyledBoxIcon>
  )
};

// ICON APP CARD COMPONENT
// =======================
import { Box, Card, styled, Typography } from "@mui/material";
import Image from "next/image";

interface IconAppCardPrps {
    path: string;
    title: string;
    subTitle?: string;
    width?: number;
    height?: number;
}

// Styled Components for IconAppCard
const CardIconApp = styled(Card)({
    cursor: "pointer",
    minHeight: 280,
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    borderRadius: "0px",
    boxShadow: "none",
    border: "1px solid #f4f4f5",
    "&:hover": {
        boxShadow: "8px 8px 24px rgba(37, 99, 235, 0.15)", 
    },
});

const BoxIconApp = styled(Box)({
    aspectRatio: "1 / 1",
    width: "fit-content",
});

const TitleText = styled(Typography)({
    marginBottom: "0px"
});

// IconAppCard Component UI Structure
export const IconAppCardUI = {
  layout: (
    <CardIconApp>
        <BoxIconApp>
            <Image src="/app-icon.png" alt="App Name" width={60} height={60} />
        </BoxIconApp>

        <TitleText color="text.primary" variant="h5">
            App Name
        </TitleText>
        <Typography color="text.secondary" variant="body1">
            App description goes here
        </Typography>
    </CardIconApp>
  )
};

// INFO ROW COMPONENT
// ==================
import { Box, styled, Typography } from "@mui/material";

export interface InfoRowProps {
    label: string;
    value: string;
}

// Styled Components for InfoRow
const BoxInfo = styled(Box)({
    width: "100%",
    display: "flex",
    gap: "24px"
});

// InfoRow Component UI Structure
export const InfoRowUI = {
  layout: (
    <BoxInfo>
        <Typography minWidth="80px" fontWeight={500} fontSize={14} color="text.secondary">
            Label
        </Typography>
        <Typography fontSize={14} fontWeight={500}>
            Value
        </Typography>
    </BoxInfo>
  ),

  examples: (
    <>
      <BoxInfo>
        <Typography minWidth="80px" fontWeight={500} fontSize={14} color="text.secondary">
            Email
        </Typography>
        <Typography fontSize={14} fontWeight={500}>
          user@example.com
        </Typography>
      </BoxInfo>
      
      <BoxInfo>
        <Typography minWidth="80px" fontWeight={500} fontSize={14} color="text.secondary">
            Phone
        </Typography>
        <Typography fontSize={14} fontWeight={500}>
          +1234567890
        </Typography>
      </BoxInfo>
      
      <BoxInfo>
        <Typography minWidth="80px" fontWeight={500} fontSize={14} color="text.secondary">
            Status
        </Typography>
        <Typography fontSize={14} fontWeight={500}>
          Active
        </Typography>
      </BoxInfo>
    </>
  )
};

// MENU POPOVER COMPONENT
// =====================
import { Box, Divider, Popover, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

export interface PopoverMenuItem {
    key: string;
    label: string;
    danger?: boolean;
    dividerTop?: boolean;
    onClick?: () => void;
}

interface MenuPopoverProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    items?: PopoverMenuItem[];
    width?: number;
    children?: React.ReactNode;
}

// Styled Components for MenuPopover
const PopoverContent = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "8px 0",
});

const MenuRow = styled(Box, {
    shouldForwardProp: (prop) => prop !== "danger",
})<{ danger?: boolean }>(({ danger }) => ({
    minHeight: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0px 16px",
    cursor: "pointer",
    color: danger ? "#E53935" : "#212121",
    "&:hover": {
        backgroundColor: "#F5F7FB",
    },
}));

const MenuLeft = styled(Box)({
    display: "flex",
    alignItems: "center",
});

const MenuText = styled(Typography)({
    fontSize: 14,
    fontWeight: 500,
});

// MenuPopover Component UI Structure
export const MenuPopoverUI = {
  layout: (
    <Popover
      open={true}
      anchorEl={null}
      onClose={() => {}}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      PaperProps={{
        sx: {
            minWidth: 210,
            borderRadius: "14px",
            boxShadow: "0px 8px 24px rgba(16, 24, 40, 0.16)",
            overflow: "hidden",
            ml: 1,
            mb: 1,
            p: 0,
        },
      }}
    >
        <PopoverContent>
            <MenuRow danger={false} onClick={() => {}}>
                <MenuLeft>
                    <MenuText>View Profile</MenuText>
                </MenuLeft>
            </MenuRow>
            
            <MenuRow danger={false} onClick={() => {}}>
                <MenuLeft>
                    <MenuText>Edit</MenuText>
                </MenuLeft>
            </MenuRow>
            
            <Divider />
            
            <MenuRow danger={true} onClick={() => {}}>
                <MenuLeft>
                    <MenuText>Delete</MenuText>
                </MenuLeft>
            </MenuRow>
        </PopoverContent>
    </Popover>
  ),

  withCustomContent: (
    <Popover
      open={true}
      anchorEl={null}
      onClose={() => {}}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      PaperProps={{
        sx: {
            minWidth: 210,
            borderRadius: "14px",
            boxShadow: "0px 8px 24px rgba(16, 24, 40, 0.16)",
            overflow: "hidden",
            ml: 1,
            mb: 1,
            p: 0,
        },
      }}
    >
        <Box p={2}>
            <Typography variant="body2">
                Custom popover content
            </Typography>
        </Box>
    </Popover>
  )
};

// STAT CARD COMPONENT
// ===================
import { Box, Grid, Stack, styled, Typography } from "@mui/material";

interface StatCardProps {
    title: string;
    subTitle?: string;
    titleColor?: string;
    leftHighlight: {
        value: string;
        label: string;
    };
    rightHighlight?: {
        value: string;
        label: string;
    };
    size?: number;
}

// Styled Components for StatCard
const TitleTextStat = styled(Typography)(({ theme }) => ({
    fontSize: "32px",
    color: theme.palette.text.primary,
    lineHeight: 1.2,
    marginTop: "32px"
}));

const SubTitleTextStat = styled(Typography)(({ theme }) => ({
    fontSize: "16px",
    fontWeight: "500",
    paddingBottom: "32px"
}));

const TextSatistics = styled(Typography)({
    color: "#0068FF",
    fontSize: "64px",
    margin: 0,
    lineHeight: 1,
});

const StatBox = styled(Box)({
    height: "100%",
    backgroundColor: "#fff",
    textAlign: "left",
    padding: "0px 32px",
});

const StatGrid = styled(Grid)({
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    maxHeight: "350px"
});

// StatCard Component UI Structure
export const StatCardUI = {
  singleHighlight: (
    <StatGrid size={6}>
        <StatBox sx={{ height: "100%" }}>
            <Stack height="100%" justifyContent="space-between">
                <Box>
                    <TitleTextStat>Zalo</TitleTextStat>
                    <SubTitleTextStat color="text.secondary">
                        Ứng dụng giao tiếp hàng đầu Việt Nam
                    </SubTitleTextStat>
                </Box>

                <Grid container width="100%">
                    <Grid size={12}>
                        <Stack>
                            <TextSatistics>2B+</TextSatistics>
                            <SubTitleTextStat color="text.primary">
                                Tin nhắn mỗi ngày
                            </SubTitleTextStat>
                        </Stack>
                    </Grid>
                </Grid>
            </Stack>
        </StatBox>
    </StatGrid>
  ),

  doubleHighlight: (
    <StatGrid size={6}>
        <StatBox sx={{ height: "100%" }}>
            <Stack height="100%" justifyContent="space-between">
                <Box>
                    <TitleTextStat>Zalo</TitleTextStat>
                    <SubTitleTextStat color="text.secondary">
                        Ứng dụng giao tiếp hàng đầu Việt Nam
                    </SubTitleTextStat>
                </Box>

                <Grid container width="100%">
                    <Grid size={6}>
                        <Stack>
                            <TextSatistics>2B+</TextSatistics>
                            <SubTitleTextStat color="text.primary">
                                Tin nhắn mỗi ngày
                            </SubTitleTextStat>
                        </Stack>
                    </Grid>

                    <Grid size={6}>
                        <Stack>
                            <TextSatistics>79M+</TextSatistics>
                            <SubTitleTextStat color="text.primary">
                                Người dùng
                            </SubTitleTextStat>
                        </Stack>
                    </Grid>
                </Grid>
            </Stack>
        </StatBox>
    </StatGrid>
  )
};
