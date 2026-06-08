"use client";

// Disable SSR to avoid hydration errors
// TODO: Re-enable after fixing dynamic values causing hydration mismatch

import React, { useState, useEffect } from "react";
import { Box, Button, Grid, Tab, Typography, useMediaQuery, Drawer, BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

import ClickAwayListener from "@mui/material/ClickAwayListener";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CancelIcon from "@mui/icons-material/Cancel";
import ForumIcon from "@mui/icons-material/Forum";

import ChatIcon from "@mui/icons-material/Chat";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import ContactsIcon from "@mui/icons-material/Contacts";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import SearchBar from "./components/SearchBar";
import AppSidebar from "./components/AppSideBar";
import FilterCategoryDropdown from "./components/DropdownCategory";
import WelcomeSite from "./components/WelcomeSite";

import { useAuthStore } from "@/src/common/store/useAuthStore";
import ChatPanel from "./components/chat/ChatPanel";
import ConversationList from "./components/chat/ConversationList";
import { useChatStore } from "@/src/common/store/useChatStore";
import { getcurrentUserId, getRefreshToken, getSessionToken } from "@/src/common/utilities/utils";
import InfConvColumn from "./components/conversation-infor/page";
import SearchSidebar from "./components/chat/SearchSidebar";
import ContactFunctionList, { ContactView } from "./components/friend/ContactFunctionList";
import ContactContentPanel from "./components/friend/ContactContentPanel";
import FriendRequestConfirmModal from "./components/friend/FriendRequestConfirmModal";
import ModalAddFriend from "./components/friend/ModalAddFriend";
import CreateGroupModal from "./components/chat/CreateGroupModal";

import SettingsPanel from "./components/settings/SettingsPanel";
import ChatbotPanel from "./components/chatbot/ChatbotPanel";
import CloudPanel from "./components/cloud/CloudPanel";
import IncomingCallDialog from "./components/call/IncomingCallDialog";
import CallDialog from "./components/call/CallDialog";

import { cleanupChat, initChat } from "@/src/common/action/chat.action";
import { handleSfuSignal } from "@/src/common/action/call.action";
import { usePresenceHeartbeat } from "@/src/common/hooks/usePresenceHeartbeat";
import { fetchAuthData } from "@/src/common/helpers/fetchDataHelpers";
import { useTrans } from "@/src/common/utilities/hook/trans";
/* ===================== styled ===================== */

const Root = styled(Grid)(() => ({
  height: "100vh",
  width: "100vw",
}));

const ConversationColumn = styled(Grid)(() => ({
  minWidth: 345,
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  borderRight: "1px solid #E5E7EB",
}));

const ChatColumn = styled(Grid)(() => ({
  // minWidth: 0,
  height: "100vh",
}));

// const InfConvColumn = styled(Grid)(() => ({
//     border: "1px solid black",
//     minWidth: "300px"
// }))

const Panel = styled(Box)(() => ({
  overflow: "hidden",
  height: "100%",
}));

const WelcomeWrap = styled(Box)(() => ({
  padding: 16,
  color: "#6B7280",
  height: "100%",
}));

export const ChatTabsWrapper = styled(Box)(() => ({
  borderBottom: "1px solid #E5E7EB",
  padding: "0 16px",
  display: "flex",
  justifyContent: "space-between",
}));

const TabsRight = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
}));

export const TabListStyled = styled(TabList)(() => ({
  minHeight: 24,

  "& .MuiTabs-flexContainer": {
    minHeight: 24,
    gap: "12px",
  },
  "& .MuiTabs-indicator": {
    height: 2,
    backgroundColor: "#005AE0",
  },
}));

export const TabStyled = styled(Tab)(() => ({
  minHeight: 32,
  height: 32,
  padding: "0",
  textTransform: "none",
  fontSize: 14,
  fontWeight: 600,
  minWidth: "unset",
  width: "auto",

  "&:hover": {
    backgroundColor: "transparent",
    color: "#005AE0",
  },
  "&.Mui-focusVisible": {
    backgroundColor: "transparent",
  },
  "& .MuiTouchRipple-root": {
    display: "none",
  },
  "&.Mui-selected": {
    color: "#005AE0",
  },
}));

const TabPanelStyled = styled(TabPanel)(() => ({
  padding: 8,
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  // margin:"0px",
  borderRadius: "8px",
}));

const CategoryFilterButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontSize: 13,
  minHeight: 24,
  height: 24,
  borderRadius: 12,
  padding: "0 12px",
  color: theme.palette.text.primary,

  "&:hover": {
    backgroundColor: "#EBECF0",
  },
  "&.active": {
    backgroundColor: "#E5F1FF",
    color: "#005ae0",
  },
}));

export const DropdownWrapper = styled(Box)(() => ({
  position: "relative",
  display: "inline-block",
}));

export const StyledMoreIcon = styled(MoreHorizIcon)(() => ({
  fontSize: 20,
  borderRadius: "50%",
  padding: 4,
  cursor: "pointer",
  transition: "background-color 0.2s ease",

  "&:hover": {
    backgroundColor: "#EBECF0",
  },
}));

const CancelIconStyled = styled(CancelIcon)(() => ({
  "&&": {
    fontSize: 16,
  },
  color: "#005AE0",
}));

const MobileLayout = styled(Box)({
  height: "100vh",
  width: "100vw",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

const MobileContent = styled(Box)({
  flex: 1,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

const MobileBottomNav = styled(Paper)({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1100,
  borderRadius: 0,
});

/* ===================== types ===================== */

type SidebarKey = "chat" | "contact" | "cloud" | "folder" | "chatbot" | "business" | "settings";

export type FilterCategoryKey =
  | "Customer"
  | "Family"
  | "Work"
  | "Friends"
  | "Reply later"
  | "Colleague"
  | "Other";

/* ===================== component ===================== */

const Me = () => {
  const t = useTrans();
  const isMobile = useMediaQuery('(max-width:767px)');
  // type ContactView = "friends" | "groups" | "friendRequests" | "sentRequests";
  const [selectedIcon, setSelectedIcon] = useState<SidebarKey>("chat");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [contactView, setContactView] = useState<ContactView>("friends");
  const [chatTab, setChatTab] = useState<string>("allChats");
  const [isSelectedCategory, setSelectedCategory] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<FilterCategoryKey[]>([]);
  const [showSearchSidebar, setShowSearchSidebar] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<"info" | "search">("info");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);
  const [selectedFriendRequest, setSelectedFriendRequest] = useState<any>(null);

  const authData = useAuthStore((s) => s.authData);
  // console.log("SenderId", authData?.data?.user?.id)
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId)
  const activeConversationId = useChatStore((s) => s.activeConversationId);

  // Close search sidebar when conversation changes
  useEffect(() => {
    setShowSearchSidebar(false);
  }, [activeConversationId]);

  // Switch to chat tab when a conversation is opened from Contact tab
  useEffect(() => {
    if (activeConversationId && selectedIcon !== "chat") {
      setSelectedIcon("chat");
    }
  }, [activeConversationId]);

  // Mobile: switch to chat view when conversation opens, back to list when closed
  useEffect(() => {
    if (isMobile) {
      if (activeConversationId) {
        setMobileView("chat");
      } else {
        setMobileView("list");
      }
    }
  }, [activeConversationId, isMobile]);

  const handleSelectedIcon = (iconName: SidebarKey) => {
    setSelectedIcon(iconName);
    if (iconName === "contact") {
      setContactView("friends");
    }
    if (iconName !== "chat") {
      setActiveConversationId(null);
    }
    if (isMobile) {
      setMobileView("list");
    }
  };

  const handleMobileBack = () => {
    setActiveConversationId(null);
    setMobileView("list");
  };

  const handleMobileInfoToggle = () => {
    setMobileInfoOpen((prev) => !prev);
  };

  const mobileBottomNavIcons: { key: SidebarKey; label: string; icon: React.ReactNode }[] = [
    { key: "chat", label: "Chat", icon: selectedIcon === "chat" ? <ChatIcon /> : <ChatOutlinedIcon /> },
    { key: "contact", label: "Contacts", icon: selectedIcon === "contact" ? <ContactsIcon /> : <ContactsOutlinedIcon /> },
    { key: "chatbot", label: "AI", icon: <SmartToyOutlinedIcon /> },
    { key: "cloud", label: "Cloud", icon: <CloudOutlinedIcon /> },
    { key: "business", label: "Business", icon: <BusinessCenterOutlinedIcon /> },
    { key: "settings", label: "Settings", icon: <SettingsOutlinedIcon /> },
  ];

  const handleOpenSettings = () => setSelectedIcon("settings");
  const handleOpenProfile = () => setSelectedIcon("settings");

  const handleChangeChatTab = (_event: React.SyntheticEvent, newTab: string) => {
    setChatTab(newTab);
  };

  const getCategoryLabel = () => {
    if (selectedCategories.length === 0) return t("ME.CATEGORY");
    if (selectedCategories.length === 1) return selectedCategories[0];
    return t("ME.CATEGORY_COUNT", { count: selectedCategories.length });
  };

  useEffect(() => {
    const accessToken = getSessionToken() || "";
    const refreshToken = getRefreshToken() || "";
    const currentUserId = getcurrentUserId() || "";
    if (accessToken && currentUserId) {
      initChat(accessToken, currentUserId);
    }

    return () => {
      cleanupChat();
    };
  }, []);
  useEffect(() => {
    fetchAuthData()
  }, [])

  const accessToken = getSessionToken() ?? ""

  const currentUserId =
    authData?.data?.user?.id ||
    getcurrentUserId() ||
    "";

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // AI Agent Event Listener for tab switching
  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetTab = customEvent.detail?.tab as SidebarKey;
      if (targetTab) {
        console.log("[AI Agent UI] Switching active tab to:", targetTab);
        handleSelectedIcon(targetTab);
      }
    };

    window.addEventListener('app:switch_tab', handleSwitchTab);
    return () => {
      window.removeEventListener('app:switch_tab', handleSwitchTab);
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      handleSfuSignal((e as CustomEvent).detail);
    };
    window.addEventListener("sfu:signal", handler);
    return () => window.removeEventListener("sfu:signal", handler);
  }, []);

  usePresenceHeartbeat({
    onPresenceUpdate: () => {},
    onUnauthorized: () => {
      window.location.href = "/auth/login";
    },
  });

  if (!mounted) {
    return null;
  }

  // Desktop layout
  if (!isMobile) {
    return (
      <Root container>
        <AppSidebar selectedIcon={selectedIcon} onSelect={handleSelectedIcon} onOpenProfile={handleOpenProfile} onOpenSettings={handleOpenSettings} />

        {(selectedIcon === "chat" || selectedIcon === "contact") && (
          <ConversationColumn>
            {selectedIcon === "chat" ? (
              <>
                <SearchBar
                  onAddFriend={() => setShowAddFriendModal(true)}
                  onCreateGroup={() => setShowCreateGroupModal(true)}
                />

                <TabContext value={chatTab}>
                  <ChatTabsWrapper data-testid="chat-tabs">
                    <TabListStyled onChange={handleChangeChatTab} aria-label="chat tabs">
                      <TabStyled label={t("ME.ALL_CHATS")} value="allChats" />
                      <TabStyled label={t("ME.UNREAD")} value="unRead" />
                    </TabListStyled>

                    <TabsRight>
                      <ClickAwayListener onClickAway={() => setSelectedCategory(false)}>
                        <DropdownWrapper>
                          <CategoryFilterButton
                            className={selectedCategories.length > 0 ? "active" : ""}
                            sx={isSelectedCategory ? { backgroundColor: "#E5F1FF", color: "#005AE0" } : null}
                            endIcon={
                              selectedCategories.length > 0 ? (
                                <CancelIconStyled
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCategories([]);
                                  }}
                                />
                              ) : (
                                <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                              )
                            }
                            onClick={() => setSelectedCategory((prev) => !prev)}
                          >
                            {getCategoryLabel()}
                          </CategoryFilterButton>

                          {isSelectedCategory && (
                            <FilterCategoryDropdown selected={selectedCategories} onChange={setSelectedCategories} />
                          )}
                        </DropdownWrapper>
                      </ClickAwayListener>
                      <StyledMoreIcon />
                    </TabsRight>
                  </ChatTabsWrapper>

                  <TabPanelStyled value="allChats">
                    <ConversationList />
                  </TabPanelStyled>
                  <TabPanelStyled value="unRead">
                    <ConversationList filterUnread />
                  </TabPanelStyled>
                </TabContext>
              </>
            ) : selectedIcon === "contact" ? (
              <>
                <SearchBar />
                <Box sx={{ flex: 1, overflowY: "auto", pt: 1 }}>
                  <ContactFunctionList value={contactView} onChange={setContactView} />
                </Box>
              </>
            ) : null}
          </ConversationColumn>
        )}

        <ChatColumn size="grow">
          <Panel>
            {selectedIcon === "chat" ? (
              !activeConversationId ? (
                <WelcomeWrap>
                  <WelcomeSite
                    slides={[
                      {
                        imageSrc:
                          "https://chat.zalo.me/assets/inapp-welcome-screen-06-darkmode.336078e876ae12bf42474586745397f0.png",
                        title: t("ME.WELCOME_SLIDE1_TITLE"),
                        description: t("ME.WELCOME_SLIDE1_DESC"),
                      },
                      {
                        imageSrc:
                          "https://chat.zalo.me/assets/zbiz_onboard_vi_3x.62514921c8505730d07aff3fa8c4e9c3.png",
                        title: t("ME.WELCOME_SLIDE2_TITLE"),
                        description:
                          t("ME.WELCOME_SLIDE2_DESC"),
                      },
                    ]}
                  />
                </WelcomeWrap>
              ) : (
                <Box sx={{ display: "flex", height: "100%" }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <ChatPanel
                      accessToken={accessToken}
                      currentUserId={currentUserId}
                      conversationId={activeConversationId}
                      title={t("ME.MESSAGES")}
                      onToggleSearch={() =>
                        setRightPanelMode((prev) => (prev === "search" ? "info" : "search"))
                      }
                      onToggleInfo={() => setRightPanelMode("info")}
                    />
                  </Box>

                  {rightPanelMode === "search" ? (
                    <SearchSidebar
                      conversationId={activeConversationId}
                      onClose={() => setRightPanelMode("info")}
                      onMessageClick={(message) => {
                        const id = `msg-${message.messageId}`;
                        const el = document.getElementById(id);
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "center" });
                          setTimeout(() => {
                            el.style.transition = "background-color 0.3s ease, border-color 0.3s ease";
                            el.style.backgroundColor = "#FFF3CD";
                            el.style.borderRadius = "8px";
                            el.style.outline = "2px solid #FCD34D";
                            setTimeout(() => {
                              el.style.backgroundColor = "";
                              el.style.outline = "";
                              el.style.borderRadius = "";
                            }, 2000);
                          }, 500);
                        }
                      }}
                    />
                  ) : (
                    <InfConvColumn conversationId={activeConversationId} />
                  )}
                </Box>
              )
            ) : selectedIcon === "contact" ? (
              <ContactContentPanel view={contactView} />
            ) : selectedIcon === "settings" ? (
              <SettingsPanel />
            ) : selectedIcon === "chatbot" ? (
              <ChatbotPanel />
            ) : selectedIcon === "cloud" ? (
              <CloudPanel />
            ) : selectedIcon === "business" ? (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#6B7280", fontSize: 16 }}>
                {t("ME.BUSINESS_DEVELOPING")}
              </Box>
            ) : null}
          </Panel>
        </ChatColumn>

        <ModalAddFriend
          open={showAddFriendModal}
          onClose={() => setShowAddFriendModal(false)}
        />

        <CreateGroupModal open={showCreateGroupModal} onClose={() => setShowCreateGroupModal(false)} />

        <FriendRequestConfirmModal
          open={showFriendRequestModal}
          onClose={() => setShowFriendRequestModal(false)}
          user={selectedFriendRequest}
          onConfirm={() => {
            setShowFriendRequestModal(false);
            setSelectedFriendRequest(null);
          }}
          onReject={() => {
            setShowFriendRequestModal(false);
            setSelectedFriendRequest(null);
          }}
        />

        <IncomingCallDialog />
        <CallDialog />
      </Root>
    );
  }

  // Mobile layout
  const showList = mobileView === "list";
  const showChat = mobileView === "chat" && activeConversationId;
  const isChatSelected = selectedIcon === "chat" || selectedIcon === "contact";

  return (
    <MobileLayout>
      <MobileContent>
        {isChatSelected && showList && (
          <>
            {selectedIcon === "chat" ? (
              <>
                <SearchBar
                  onAddFriend={() => setShowAddFriendModal(true)}
                  onCreateGroup={() => setShowCreateGroupModal(true)}
                />
                <TabContext value={chatTab}>
                  <ChatTabsWrapper data-testid="chat-tabs">
                    <TabListStyled onChange={handleChangeChatTab} aria-label="chat tabs">
                      <TabStyled label={t("ME.ALL_CHATS")} value="allChats" />
                      <TabStyled label={t("ME.UNREAD")} value="unRead" />
                    </TabListStyled>
                    <TabsRight>
                      <ClickAwayListener onClickAway={() => setSelectedCategory(false)}>
                        <DropdownWrapper>
                          <CategoryFilterButton
                            className={selectedCategories.length > 0 ? "active" : ""}
                            sx={isSelectedCategory ? { backgroundColor: "#E5F1FF", color: "#005AE0" } : null}
                            endIcon={
                              selectedCategories.length > 0 ? (
                                <CancelIconStyled onClick={(e) => { e.stopPropagation(); setSelectedCategories([]); }} />
                              ) : (
                                <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                              )
                            }
                            onClick={() => setSelectedCategory((prev) => !prev)}
                          >
                            {getCategoryLabel()}
                          </CategoryFilterButton>
                          {isSelectedCategory && (
                            <FilterCategoryDropdown selected={selectedCategories} onChange={setSelectedCategories} />
                          )}
                        </DropdownWrapper>
                      </ClickAwayListener>
                      <StyledMoreIcon />
                    </TabsRight>
                  </ChatTabsWrapper>
                  <TabPanelStyled value="allChats" sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <ConversationList />
                  </TabPanelStyled>
                  <TabPanelStyled value="unRead" sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <ConversationList filterUnread />
                  </TabPanelStyled>
                </TabContext>
              </>
            ) : (
              <>
                <SearchBar />
                <Box sx={{ flex: 1, overflowY: "auto", pt: 1 }}>
                  <ContactFunctionList value={contactView} onChange={setContactView} />
                </Box>
              </>
            )}
          </>
        )}

        {isChatSelected && showChat && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ChatPanel
              accessToken={accessToken}
              currentUserId={currentUserId}
              conversationId={activeConversationId!}
              title={t("ME.MESSAGES")}
              onToggleSearch={() => setRightPanelMode((prev) => (prev === "search" ? "info" : "search"))}
              onToggleInfo={handleMobileInfoToggle}
              onBackClick={handleMobileBack}
            />
          </Box>
        )}

        {!isChatSelected && selectedIcon === "settings" && <SettingsPanel />}
        {!isChatSelected && selectedIcon === "chatbot" && <ChatbotPanel />}
        {!isChatSelected && selectedIcon === "cloud" && <CloudPanel />}
        {!isChatSelected && selectedIcon === "business" && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#6B7280", fontSize: 16 }}>
            {t("ME.BUSINESS_DEVELOPING")}
          </Box>
        )}
      </MobileContent>

      <MobileBottomNav elevation={8}>
        <BottomNavigation
          value={selectedIcon}
          onChange={(_, newValue) => handleSelectedIcon(newValue)}
          showLabels
          sx={{ height: 60, "& .MuiBottomNavigationAction-label": { fontSize: 11, mt: 0.25 } }}
        >
          {mobileBottomNavIcons.map((item) => (
            <BottomNavigationAction
              key={item.key}
              value={item.key}
              label={item.label}
              icon={item.icon}
              sx={{
                minWidth: 0,
                py: 0.5,
                color: selectedIcon === item.key ? "#005AE0" : "rgba(0,0,0,0.6)",
                "&.Mui-selected": { color: "#005AE0" },
              }}
            />
          ))}
        </BottomNavigation>
      </MobileBottomNav>

      <Drawer
        anchor="right"
        open={mobileInfoOpen}
        onClose={() => setMobileInfoOpen(false)}
        PaperProps={{ sx: { width: "85vw", maxWidth: 380 } }}
      >
        {activeConversationId && <InfConvColumn conversationId={activeConversationId} />}
      </Drawer>

      <ModalAddFriend open={showAddFriendModal} onClose={() => setShowAddFriendModal(false)} />
      <CreateGroupModal open={showCreateGroupModal} onClose={() => setShowCreateGroupModal(false)} />
      <FriendRequestConfirmModal
        open={showFriendRequestModal}
        onClose={() => setShowFriendRequestModal(false)}
        user={selectedFriendRequest}
        onConfirm={() => { setShowFriendRequestModal(false); setSelectedFriendRequest(null); }}
        onReject={() => { setShowFriendRequestModal(false); setSelectedFriendRequest(null); }}
      />

      <IncomingCallDialog />
      <CallDialog />
    </MobileLayout>
  );
};

export default Me;
