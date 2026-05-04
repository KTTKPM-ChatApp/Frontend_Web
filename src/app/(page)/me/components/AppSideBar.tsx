"use client";

import { Box, Stack, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import ChatIcon from "@mui/icons-material/Chat";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import ContactsIcon from "@mui/icons-material/Contacts";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import CloudIcon from "@mui/icons-material/Cloud";
import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SettingsIcon from "@mui/icons-material/Settings";

import { useMemo, useState } from "react";
import BoxIcon from "@/src/shared/component/BoxIcon";
import MenuPopover, { PopoverMenuItem } from "@/src/shared/component/MenuPopover";
import { SidebarKey } from "@/src/app/constant";
import { useAuthStore } from "@/src/common/store/useAuthStore";
import { authService } from "@/src/common/service/auth-service";
import { clearAuthStorage, redirectToLogin } from "@/src/common/utilities/utils";
import { useTrans } from "@/src/common/utilities/hook/trans";
import ProfileModals from "./ProfileModals";
import ChangePasswordModal from "./ChangePswModal";
import LanguageSwitcher from "@/src/shared/component/LanguageSwitcher";

const Sidebar = styled(Box)({
  minWidth: 56,
  height: "100vh",
  backgroundColor: "#005ae0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0px 4px",
});

const AvatarStyled = styled(Avatar)({
  width: 40,
  height: 40,
  cursor: "pointer",
});

interface AppSidebarProps {
  selectedIcon: SidebarKey | string;
  onSelect: (iconName: SidebarKey) => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenEditProfile?: () => void;
}

const AppSidebar = ({
  selectedIcon,
  onSelect,
  onOpenProfile,
  onOpenSettings,
}: AppSidebarProps) => {
  const resetAuth = useAuthStore((s) => s.resetAuth);
  const t = useTrans();

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [activePopover, setActivePopover] = useState<"settings" | "avatar" | null>(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [pendingOpenEdit, setPendingOpenEdit] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
  const [openLanguageModal, setOpenLanguageModal] = useState(false);

  const openMenuPopover = Boolean(menuAnchorEl) && Boolean(activePopover);

  const handleOpenChangePasswordModal = () => {
    closePopoverThen(() => {
      setOpenChangePasswordModal(true);
    });
  };

  const handleOpenLanguageModal = () => {
    closePopoverThen(() => {
      setOpenLanguageModal(true);
    });
  };

  const handleMenuItemClick =
    (action?: () => void) =>
      () => {
        closePopoverThen(action);
      };

  const handleOpenPopover =
    (type: "settings" | "avatar") =>
      (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();

        const isSamePopoverOpen = activePopover === type && Boolean(menuAnchorEl);

        if (isSamePopoverOpen) {
          setMenuAnchorEl(null);
          setActivePopover(null);
          return;
        }

        setMenuAnchorEl(event.currentTarget);
        setActivePopover(type);
      };

  const closePopoverThen = (action?: () => void) => {
    const el = document.activeElement as HTMLElement | null;
    el?.blur();

    setMenuAnchorEl(null);
    setActivePopover(null);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        action?.();
      });
    });
  };

  const handleClosePopover = () => {
    setMenuAnchorEl(null);
    setActivePopover(null);
  };

  const handleOpenProfileModal = () => {
    closePopoverThen(() => {
      setOpenProfileModal(true);
    });
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    handleClosePopover();

    try {
      await authService.authLogout();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      clearAuthStorage();
      resetAuth();
      redirectToLogin();
    }
  };

  const settingsItems = useMemo<PopoverMenuItem[]>(
    () => [
      {
        key: "account",
        label: t("PROFILE.ACCOUNT_INFO"),
        onClick: handleMenuItemClick(onOpenProfile),
      },
      {
        key: "settings",
        label: t("COMMON.SETTINGS"),
        onClick: handleMenuItemClick(onOpenSettings),
      },
      {
        key: "change_password",
        label: t("COMMON.CHANGE_PASSWORD"),
        dividerTop: true,
        onClick: handleOpenChangePasswordModal,
      },
      {
        key: "language",
        label: t("COMMON.LANGUAGE"),
        onClick: handleOpenLanguageModal,
      },
      {
        key: "support",
        label: t("COMMON.SUPPORT"),
      },
      {
        key: "logout",
        label: t("COMMON.LOGOUT"),
        danger: true,
        dividerTop: true,
        onClick: () => {
          void handleLogout();
        },
      },
    ],
    [onOpenProfile, onOpenSettings, t]
  );

  const avatarItems = useMemo<PopoverMenuItem[]>(
    () => [
      {
        key: "account",
        label: t("PROFILE.ACCOUNT_INFO"),
        onClick: handleMenuItemClick(onOpenProfile),
      },
      {
        key: "profile",
        label: t("PROFILE.YOUR_PROFILE"),
        dividerTop: true,
        onClick: handleOpenProfileModal,
      },
      {
        key: "logout",
        label: t("COMMON.LOGOUT"),
        danger: true,
        dividerTop: true,
        onClick: () => {
          void handleLogout();
        },
      },
    ],
    [onOpenProfile, t]
  );

  const avatarUrl = useAuthStore((s) => s.authData?.data?.user?.avatarUrl);

  const currentItems =
    activePopover === "avatar"
      ? avatarItems
      : activePopover === "settings"
        ? settingsItems
        : [];

  return (
    <Grid data-testid="app-sidebar" sx={{ minWidth: 56, height: "100vh" }}>
      <Sidebar>
        <Box mt="32px">
          <AvatarStyled
            src={avatarUrl ?? ""}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPopover("avatar")(e);
            }}
          />
        </Box>

        <ProfileModals
          openProfileModal={openProfileModal}
          setOpenProfileModal={setOpenProfileModal}
          pendingOpenEdit={pendingOpenEdit}
          setPendingOpenEdit={setPendingOpenEdit}
        />

        <ChangePasswordModal
          open={openChangePasswordModal}
          onClose={() => setOpenChangePasswordModal(false)}
        />

        <LanguageSwitcher
          open={openLanguageModal}
          onClose={() => setOpenLanguageModal(false)}
        />

        <Stack justifyContent="space-between" height="100%">
          <Stack mt={2} spacing={1.25} alignItems="center">
            <BoxIcon
              outlined={ChatOutlinedIcon}
              filled={ChatIcon}
              selected={selectedIcon === "chat"}
              onClick={() => onSelect("chat")}
            />

            <BoxIcon
              outlined={ContactsOutlinedIcon}
              filled={ContactsIcon}
              selected={selectedIcon === "contact"}
              onClick={() => onSelect("contact")}
            />
          </Stack>

          <Stack mb={2} spacing={1.25} alignItems="center">
            <BoxIcon
              outlined={CloudOutlinedIcon}
              filled={CloudIcon}
              selected={selectedIcon === "cloud"}
              onClick={() => onSelect("cloud")}
            />

            <BoxIcon
              outlined={FolderCopyOutlinedIcon}
              filled={FolderCopyIcon}
              selected={selectedIcon === "folder"}
              onClick={() => onSelect("folder")}
            />

            <BoxIcon
              outlined={BusinessCenterOutlinedIcon}
              filled={BusinessCenterIcon}
              selected={selectedIcon === "business"}
              onClick={() => onSelect("business")}
            />

            <BoxIcon
              outlined={SettingsOutlinedIcon}
              filled={SettingsIcon}
              selected={activePopover === "settings"}
              onClick={handleOpenPopover("settings")}
            />
          </Stack>
        </Stack>
      </Sidebar>

      <MenuPopover
        anchorEl={menuAnchorEl}
        open={openMenuPopover}
        onClose={handleClosePopover}
        items={currentItems}
      />
    </Grid>
  );
};

export default AppSidebar;