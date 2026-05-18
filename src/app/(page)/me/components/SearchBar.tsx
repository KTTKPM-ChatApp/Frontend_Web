"use client";

import {
    Box,
    Grid,
    IconButton,
    Typography,
    List,
    ListItem,
    ListItemText,
    Paper,
    Avatar,
    CircularProgress,
} from "@mui/material";
import InputBase from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import { useState, useMemo, useEffect } from "react";
import { useChatStore } from "@/src/common/store/useChatStore";
import { ConversationDto } from "@/src/common/interface/chat-interface";
import {
    userService,
} from "@/src/common/service/user-service";
// import { resolveMediaUrl } from "@/src/common/helpers/displayMedia.helpers";
import { searchService } from "@/src/common/service/search-service";
import { chatService } from "@/src/common/service/chat-service";
import { fetchListConversation, openConversation } from "@/src/common/action/chat.action";
import { IUserSearchItem, SearchResult } from "@/src/common/interface/search-interface";
import { useDebounce } from "@/src/common/utilities/hook/debounce";

interface SearchBarProps {
    onResultSelect?: (result: SearchResult) => void;
    onAddFriend?: () => void;
    onCreateGroup?: () => void;
}

const BoxSearchBar = styled(Box)({
    height: 32,
    minWidth: 50,
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ebecf0",
    padding: "0px 8px",
    borderRadius: 5,
    transition: "all 0.2s ease",
    position: "relative",

    "&:hover": {
        backgroundColor: "#e5e7eb",
    },

    "&:focus-within": {
        boxShadow: "0 0 0 .5px #005ae0",
    },
});

const SearchInput = styled(InputBase)({
    padding: "0px 8px",
    fontSize: 14,
    flex: 1,
    width: "100%",
});

const ActionBtn = styled(IconButton)({
    width: "fit-content",
    height: 32,
    borderRadius: "5px",
    "&:hover": {
        backgroundColor: "#e5e7eb",
    },
});

const CloseSearch = styled(Typography)({
    minWidth: "68px",
    fontWeight: 600,
    color: "#000000",
});

const GridSearch = styled(Grid)({
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    padding: "16px",
});

const SearchResultsContainer = styled(Paper)({
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: "auto",
    minWidth: 320,
    maxHeight: 360,
    overflowY: "auto",
    zIndex: 1000,
});

const SearchResultItem = styled(ListItem)({
    cursor: "pointer",
    "&:hover": {
        backgroundColor: "#f0f0f0",
    },
});
const SearchBar = ({ onResultSelect, onAddFriend, onCreateGroup }: SearchBarProps) => {
    const [focusOnSearch, setFocusOnSearch] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [userResults, setUserResults] = useState<IUserSearchItem[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const debounceSearch = useDebounce(searchValue, 300);
    const { listConversation } = useChatStore();

    const handleFocusSearchBar = () => {
        setFocusOnSearch(true);
    };

    
    const friendConversationResults = useMemo<SearchResult[]>(() => {
        const keyword = debounceSearch.trim().toLowerCase();
        if (!keyword) return [];

        return listConversation
            .filter((conv) => conv.name?.toLowerCase().includes(keyword))
            .map((conv) => ({
                kind: "conversation" as const,
                id: conv.id,
                name: conv.name,
                avatarUrl: (conv as any).avatarUrl ?? null,
                memberCount: conv.memberCount,
                conversation: conv,
            }));
    }, [debounceSearch, listConversation]);

    useEffect(() => {
        const keyword = debounceSearch.trim();
        if (!keyword) {
            setUserResults([]);
            setSearchError(null);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setLoadingSearch(true);
                setSearchError(null);

                const response = await searchService.searchUsers({
                    q: keyword,
                    offset: 0,
                    limit: 20,
                });

                const users = response?.payload?.data || [];
                setUserResults(Array.isArray(users) ? users : []);
            } catch (error: any) {
                console.error("search user error:", error);
                setSearchError(error?.message || "Không thể tìm kiếm người dùng");
                setUserResults([]);
            } finally {
                setLoadingSearch(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchValue]);

    const searchResults = useMemo<SearchResult[]>(() => {
        if (!searchValue.trim()) return [];

        // Hiển thị cả user search và conversation search
        const userSearchResults = userResults.map((user) => ({
            kind: "user" as const,
            id: user.id,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            phone: user.phone,
            friendshipStatus: user.friendshipStatus,
            user,
        }));

        return [...userSearchResults, ...friendConversationResults];
    }, [searchValue, userResults, friendConversationResults]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    const handleSelectResult = async (result: SearchResult) => {
        if (result.kind === "conversation") {
            await openConversation(result.conversation.id);
            setSearchValue("");
            setFocusOnSearch(false);
            onResultSelect?.(result);
            return;
        }

        // Check if a direct conversation already exists locally
        const existingConv = listConversation.find((conv) => {
            if (conv.type !== "direct") return false;
            const otherMember = (conv as any).members?.find(
                (m: any) => m.userId === result.id
            );
            return !!otherMember;
        });

        if (existingConv) {
            await openConversation(existingConv.id);
            setSearchValue("");
            setFocusOnSearch(false);
            onResultSelect?.(result);
            return;
        }

        // Handle user click - create direct conversation
        try {
            setLoadingSearch(true);
            const response = await chatService.createDirectConversation({
                participantId: result.id
            });
            
            if (response.ok && response.payload?.data) {
                const newConversation = response.payload.data;
                
                let finalConversation = newConversation;
                if (!newConversation.members || newConversation.members.length === 0) {
                    finalConversation = {
                        ...newConversation,
                        name: result.displayName || result.user?.displayName || newConversation.name,
                        members: [{
                            userId: result.id,
                            displayName: result.displayName || result.user?.displayName,
                            role: "MEMBER"
                        }]
                    };
                }
                
                const res = await chatService.fetchListConversations({ page: 1, limit: 100 });
                
                if (res?.ok && res?.payload?.data) {
                    const updatedList = res.payload.data;
                    const exists = updatedList.find((c: any) => c.id === finalConversation.id);
                    
                    if (!exists) {
                        const currentList = useChatStore.getState().listConversation;
                        useChatStore.getState().setListConversation([finalConversation, ...currentList]);
                    } else {
                        useChatStore.getState().setListConversation(updatedList);
                    }
                }
                
                await openConversation(finalConversation.id);
            } else {
                console.error("Failed to create direct conversation:", response);
            }
        } catch (error) {
            console.error("Failed to create direct conversation:", error);
        } finally {
            setLoadingSearch(false);
            setSearchValue("");
            setFocusOnSearch(false);
        }
    };

    return (
        <Box sx={{ position: "relative", width: "100%" }}>
            <GridSearch>
                <Box sx={{ position: "relative", flex: 1 }}>
                    <BoxSearchBar onFocus={handleFocusSearchBar}>
                        <SearchIcon sx={{ fontSize: 22, color: "#353535" }} />
                        <SearchInput
                            placeholder="Tìm kiếm"
                            value={searchValue}
                            onChange={handleSearchChange}
                        />
                    </BoxSearchBar>

                    {focusOnSearch && searchValue.trim() && (
                        <SearchResultsContainer>
                            {loadingSearch ? (
                                <Box sx={{ p: 2, textAlign: "center" }}>
                                    <CircularProgress size={20} />
                                </Box>
                            ) : searchError ? (
                                <Box sx={{ p: 2, textAlign: "center" }}>
                                    <Typography color="error">{searchError}</Typography>
                                </Box>
                            ) : searchResults.length > 0 ? (
                                <List sx={{ py: 0 }}>
                                    {searchResults.map((result) => (
                                        <SearchResultItem
                                            key={`${result.kind}-${result.id}`}
                                            onClick={() => handleSelectResult(result)}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1.5,
                                                    width: "100%",
                                                }}
                                            >
                                                <Avatar
                                                    src={
                                                        result.avatarUrl
                                                            ? result.avatarUrl
                                                            : undefined
                                                    }
                                                >
                                                    {(result.kind === "conversation"
                                                        ? result.name
                                                        : result.displayName
                                                    )
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}
                                                </Avatar>

                                                <ListItemText
                                                    primary={
                                                        result.kind === "conversation"
                                                            ? result.name
                                                            : result.displayName
                                                    }
                                                    // secondary={
                                                    //     result.kind === "conversation"
                                                    //         ? `${result.memberCount || 1} thành viên`
                                                    //         : `${result.phone} • ${result.friendshipStatus}`
                                                    // }
                                                />
                                            </Box>
                                        </SearchResultItem>
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{ p: 2, textAlign: "center" }}>
                                    <Typography color="textSecondary">
                                        Không tìm thấy kết quả
                                    </Typography>
                                </Box>
                            )}
                        </SearchResultsContainer>
                    )}
                </Box>

                {focusOnSearch ? (
                    <ActionBtn
                        onClick={() => {
                            setFocusOnSearch(false);
                            setSearchValue("");
                            setUserResults([]);
                            setSearchError(null);
                        }}
                    >
                        <CloseSearch>Đóng</CloseSearch>
                    </ActionBtn>
                ) : (
                    <>
                        <ActionBtn onClick={onAddFriend}>
                            <PersonAddAltOutlinedIcon sx={{ fontSize: 22, color: "#353535" }} />
                        </ActionBtn>
                        <ActionBtn onClick={onCreateGroup}>
                            <GroupAddOutlinedIcon sx={{ fontSize: 22, color: "#353535" }} />
                        </ActionBtn>
                    </>
                )}
            </GridSearch>
        </Box>
    );
};

export default SearchBar;