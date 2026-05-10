"use client";

import React, { useState, useEffect } from "react";
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

import { useAuthStore } from "@/src/common/store/useAuthStore";
import ChatPanel from "./components/chat/ChatPanel";
import ConversationList from "./components/chat/ConversationList";
import { useChatStore } from "@/src/common/store/useChatStore";
import { getcurrentUserId, getRefreshToken, getSessionToken } from "@/src/common/utilities/utils";
import InfConvColumn from "./components/conversation-infor/page";
import { cleanupChat, initChat } from "@/src/common/action/chat.action";
import { fetchAuthData } from "@/src/common/helpers/fetchDataHelpers";
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

/* ===================== types ===================== */

type SidebarKey = "chat" | "contact" | "cloud" | "folder" | "business" | "settings";

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
    const [selectedIcon, setSelectedIcon] = useState<SidebarKey>("chat");
    const [chatTab, setChatTab] = useState<string>("allChats");
    const [isSelectedCategory, setSelectedCategory] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<FilterCategoryKey[]>([]);
    const authData = useAuthStore((s) => s.authData);
    // console.log("SenderId", authData?.data?.user?.id)
    
    const activeConversationId = useChatStore((s) => s.activeConversationId);

    const handleSelectedIcon = (iconName: SidebarKey) => {
        setSelectedIcon(iconName);
    };

    const handleChangeChatTab = (_event: React.SyntheticEvent, newTab: string) => {
        setChatTab(newTab);
    };

    const getCategoryLabel = () => {
        if (selectedCategories.length === 0) return "Phân loại";
        if (selectedCategories.length === 1) return selectedCategories[0];
        return `${selectedCategories.length} thẻ`;
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

    
    console.log("user data", authData)
    const accessToken = getSessionToken() ?? ""

    const currentUserId =
        authData?.data?.user?.id ||
        getcurrentUserId() ||
        "";

    return (
        <Root container>
            <AppSidebar selectedIcon={selectedIcon} onSelect={handleSelectedIcon} />

            <ConversationColumn>
                <SearchBar />

                <TabContext value={chatTab}>
                    <ChatTabsWrapper data-testid="chat-tabs">
                        <TabListStyled onChange={handleChangeChatTab} aria-label="chat tabs">
                            <TabStyled label="Tất cả" value="allChats" />
                            <TabStyled label="Chưa đọc" value="unRead" />
                        </TabListStyled>

                        <TabsRight>
                            <ClickAwayListener onClickAway={() => setSelectedCategory(false)}>
                                <DropdownWrapper>
                                    <CategoryFilterButton
                                        className={selectedCategories.length > 0 ? "active" : ""}
                                        sx={
                                            isSelectedCategory
                                                ? { backgroundColor: "#E5F1FF", color: "#005AE0" }
                                                : null
                                        }
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
                                        <FilterCategoryDropdown
                                            selected={selectedCategories}
                                            onChange={setSelectedCategories}
                                        />
                                    )}
                                </DropdownWrapper>
                            </ClickAwayListener>

                            <StyledMoreIcon />
                        </TabsRight>
                    </ChatTabsWrapper>

                    <TabPanelStyled value="allChats">
                        <ConversationList />
                    </TabPanelStyled>

                    <TabPanelStyled value="unRead">Unread</TabPanelStyled>
                </TabContext>
            </ConversationColumn>

            <ChatColumn size="grow">
                <Panel >
                    {!activeConversationId ? (
                        <WelcomeWrap>
                            <WelcomeSite
                                slides={[
                                    {
                                        imageSrc:
                                            "https://chat.zalo.me/assets/inapp-welcome-screen-06-darkmode.336078e876ae12bf42474586745397f0.png",
                                        title: "Giao diện Dark Mode",
                                        description:
                                            "Thư giãn và bảo vệ mắt với chế độ giao diện tối trên Zalo PC",
                                    },
                                    {
                                        imageSrc:
                                            "https://chat.zalo.me/assets/zbiz_onboard_vi_3x.62514921c8505730d07aff3fa8c4e9c3.png",
                                        title: "Kinh doanh hiệu quả với Buisiness Pro",
                                        description:
                                            "Trải nghiệm giao diện sáng trên Zalo PC, mang đến sự tươi mới và dễ nhìn cho mọi cuộc trò chuyện của bạn.",
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
                                    title="Tin nhắn"
                                />
                            </Box>

                            <InfConvColumn conversationId={activeConversationId} />
                        </Box>


                    )}
                </Panel>
            </ChatColumn>
        </Root>
    );
};

export default Me;
