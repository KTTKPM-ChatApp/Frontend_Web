"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Tab } from "@mui/material";
import { styled } from "@mui/material/styles";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CancelIcon from "@mui/icons-material/Cancel";

import SearchBar from "./components/SearchBar";
import AppSidebar from "./components/AppSideBar";
import FilterCategoryDropdown from "./components/DropdownCategory";
import WelcomeSite from "./components/WelcomeSite";
import ChatPanel from "./components/chat/ChatPanel";
import ConversationList from "./components/chat/ConversationList";
import InfConvColumn from "./components/conversation-infor/page";
import SearchSidebar from "./components/chat/SearchSidebar";
import ContactFunctionList, { ContactView } from "./components/friend/ContactFunctionList";
import ContactContentPanel from "./components/friend/ContactContentPanel";
import FriendRequestConfirmModal from "./components/friend/FriendRequestConfirmModal";
import ModalAddFriend from "./components/friend/ModalAddFriend";
import CreateGroupModal from "./components/chat/CreateGroupModal";

import { useAuthStore } from "@/src/common/store/useAuthStore";
import { useChatStore } from "@/src/common/store/useChatStore";
import { getcurrentUserId, getSessionToken } from "@/src/common/utilities/utils";
import { cleanupChat, initChat } from "@/src/common/action/chat.action";
import { fetchAuthData } from "@/src/common/helpers/fetchDataHelpers";
import { useTrans } from "@/src/common/utilities/hook/trans";

const Root = styled(Grid)({
  height: "100vh",
  width: "100vw",
  background: "#F7F8FA",
});

const ConversationColumn = styled(Grid)({
  minWidth: 346,
  maxWidth: 346,
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  borderRight: "1px solid #E5E7EB",
  background: "#FFFFFF",
});

const ChatColumn = styled(Grid)({
  height: "100vh",
});

const Panel = styled(Box)({
  overflow: "hidden",
  height: "100%",
});

const WelcomeWrap = styled(Box)({
  padding: 16,
  color: "#6B7280",
  height: "100%",
});

const ChatTabsWrapper = styled(Box)({
  borderBottom: "1px solid #E5E7EB",
  padding: "0 12px",
  display: "flex",
  justifyContent: "space-between",
});

const TabsRight = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 4,
});

const TabListStyled = styled(TabList)({
  minHeight: 24,
  "& .MuiTabs-flexContainer": {
    minHeight: 24,
    gap: "12px",
  },
  "& .MuiTabs-indicator": {
    height: 2,
    backgroundColor: "#0068FF",
  },
});

const TabStyled = styled(Tab)({
  minHeight: 34,
  height: 34,
  padding: "0",
  textTransform: "none",
  fontSize: 14,
  fontWeight: 700,
  minWidth: "unset",
  width: "auto",
  "&:hover": {
    backgroundColor: "transparent",
    color: "#0068FF",
  },
  "& .MuiTouchRipple-root": {
    display: "none",
  },
  "&.Mui-selected": {
    color: "#0068FF",
  },
});

const TabPanelStyled = styled(TabPanel)({
  padding: "8px 0 8px 8px",
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
});

const CategoryFilterButton = styled(Button)({
  textTransform: "none",
  fontSize: 13,
  minHeight: 28,
  height: 28,
  borderRadius: 14,
  padding: "0 10px",
  color: "#334155",
  "&:hover": {
    backgroundColor: "#EBECF0",
  },
  "&.active": {
    backgroundColor: "#E5F1FF",
    color: "#005AE0",
  },
});

const DropdownWrapper = styled(Box)({
  position: "relative",
  display: "inline-block",
});

const StyledMoreIcon = styled(MoreHorizIcon)({
  fontSize: 20,
  borderRadius: "50%",
  padding: 4,
  cursor: "pointer",
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor: "#EBECF0",
  },
});

const CancelIconStyled = styled(CancelIcon)({
  fontSize: 16,
  color: "#005AE0",
});

type SidebarKey = "chat" | "contact" | "cloud" | "folder" | "business" | "settings";
type RightPanelMode = "info" | "search";

export type FilterCategoryKey =
  | "Customer"
  | "Family"
  | "Work"
  | "Friends"
  | "Reply later"
  | "Colleague"
  | "Other";

const Me = () => {
  const t = useTrans();
  const [selectedIcon, setSelectedIcon] = useState<SidebarKey>("chat");
  const [contactView, setContactView] = useState<ContactView>("friends");
  const [chatTab, setChatTab] = useState<string>("allChats");
  const [isSelectedCategory, setSelectedCategory] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<FilterCategoryKey[]>([]);
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>("info");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);
  const [selectedFriendRequest, setSelectedFriendRequest] = useState<{
    id: string;
    name: string;
    avatar?: string;
    message?: string;
  } | null>(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  const authData = useAuthStore((s) => s.authData);
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);
  const activeConversationId = useChatStore((s) => s.activeConversationId);

  useEffect(() => {
    setRightPanelMode("info");
  }, [activeConversationId]);

  useEffect(() => {
    const accessToken = getSessionToken() || "";
    const currentUserId = getcurrentUserId() || "";
    if (accessToken && currentUserId) {
      initChat(accessToken, currentUserId);
    }
    return () => {
      cleanupChat();
    };
  }, []);

  useEffect(() => {
    fetchAuthData();
  }, []);

  const handleSelectedIcon = (iconName: SidebarKey) => {
    setSelectedIcon(iconName);
    if (iconName === "contact") {
      setContactView("friends");
      setActiveConversationId(null);
    }
  };

  const handleChangeChatTab = (_event: React.SyntheticEvent, newTab: string) => {
    setChatTab(newTab);
  };

  const getCategoryLabel = () => {
    if (selectedCategories.length === 0) return "Danh mục";
    if (selectedCategories.length === 1) return selectedCategories[0];
    return `${selectedCategories.length} danh mục`;
  };

  const accessToken = getSessionToken() ?? "";
  const currentUserId = authData?.data?.user?.id || getcurrentUserId() || "";

  return (
    <Root container>
      <AppSidebar selectedIcon={selectedIcon} onSelect={handleSelectedIcon} />

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
              <TabPanelStyled value="unRead">{t("ME.UNREAD")}</TabPanelStyled>
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
                      title: "Giao diện Dark Mode",
                      description: "Thư giãn và bảo vệ mắt với chế độ giao diện tối trên Zalo PC",
                    },
                    {
                      imageSrc:
                        "https://chat.zalo.me/assets/zbiz_onboard_vi_3x.62514921c8505730d07aff3fa8c4e9c3.png",
                      title: "Kinh doanh hiệu quả với Business Pro",
                      description:
                        "Trải nghiệm giao diện sáng trên Zalo PC, mang đến sự tươi mới và dễ nhìn cho mọi cuộc trò chuyện.",
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
                      const messageElement = document.getElementById(`message-${message.messageId}`);
                      if (messageElement) {
                        messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
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
          ) : null}
        </Panel>
      </ChatColumn>

      <ModalAddFriend
        open={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        onSendRequest={() => setShowAddFriendModal(false)}
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
    </Root>
  );
};

export default Me;
