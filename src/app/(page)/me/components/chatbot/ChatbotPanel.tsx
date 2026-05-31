"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Box, TextField, IconButton, Typography, CircularProgress, Paper, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { chatbotService } from "@/src/common/service/chatbot-service";
import type { ChatbotConversation, ChatbotMessage } from "@/src/common/interface/chatbot-interface";
import { useTranslation } from "react-i18next";

const ActionLinkButton = ({ metadata }: { metadata: string }) => {
  const { i18n } = useTranslation();
  const isEn = i18n.language === "en";

  try {
    const actionObj = JSON.parse(metadata);
    let label = "";
    let tab = "";

    if (actionObj.type === "switch_tab") {
      tab = actionObj.payload;
      if (tab === "cloud") label = isEn ? "Go to Cloud Drive" : "Đi tới Cloud Drive";
      else if (tab === "contact") label = isEn ? "Go to Contacts" : "Đi tới Bạn bè";
      else if (tab === "chat") label = isEn ? "Go to Chats" : "Đi tới Đoạn chat";
      else if (tab === "settings") label = isEn ? "Go to Settings" : "Đi tới Cài đặt";
      else label = isEn ? `Switch to tab ${tab}` : `Chuyển sang tab ${tab}`;
    } else if (actionObj.type === "create_cloud_file" || actionObj.type === "delete_cloud_file") {
      tab = "cloud";
      label = isEn ? "Go to Cloud Drive" : "Đi tới Cloud Drive";
    } else if (actionObj.type === "add_friend" || actionObj.type === "remove_friend") {
      tab = "contact";
      label = isEn ? "Go to Contacts" : "Đi tới Bạn bè";
    }

    if (!tab) return null;

    const handleClick = () => {
      window.dispatchEvent(
        new CustomEvent("app:switch_tab", { detail: { tab } })
      );
    };

    return (
      <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-start" }}>
        <Button
          variant="contained"
          size="small"
          onClick={handleClick}
          sx={{
            backgroundColor: "#ffffff",
            color: "#005AE0",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: "18px",
            border: "1px solid #005AE0",
            px: 2,
            py: 0.5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            "&:hover": {
              backgroundColor: "#E3F2FD",
              borderColor: "#0048CC",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            },
          }}
        >
          {label}
        </Button>
      </Box>
    );
  } catch (e) {
    return null;
  }
};

const Root = styled(Box)({
  display: "flex",
  height: "100%",
  width: "100%",
});

const ConversationSidebar = styled(Box)({
  width: 280,
  minWidth: 280,
  borderRight: "1px solid #E5E7EB",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#FAFAFA",
});

const ConversationHeader = styled(Box)({
  padding: "16px",
  borderBottom: "1px solid #E5E7EB",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const ConversationList = styled(Box)({
  flex: 1,
  overflowY: "auto",
  padding: "8px",
});

const ConversationItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ active }) => ({
  padding: "12px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "4px",
  backgroundColor: active ? "#E3F2FD" : "transparent",
  transition: "background-color 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  "&:hover": {
    backgroundColor: active ? "#E3F2FD" : "#F5F5F5",
  },
}));

const ChatArea = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

const ChatHeader = styled(Box)({
  padding: "16px 20px",
  borderBottom: "1px solid #E5E7EB",
  display: "flex",
  alignItems: "center",
  gap: "12px",
});

const MessagesContainer = styled(Box)({
  flex: 1,
  overflowY: "auto",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
});

const MessageBubble = styled(Box)<{ isuser?: string }>(({ isuser }) => ({
  display: "flex",
  gap: "12px",
  maxWidth: "75%",
  alignSelf: isuser === "true" ? "flex-end" : "flex-start",
  flexDirection: isuser === "true" ? "row-reverse" : "row",
}));

const BubbleContent = styled(Paper)<{ isuser?: string }>(({ isuser }) => ({
  padding: "12px 16px",
  borderRadius: "16px",
  backgroundColor: isuser === "true" ? "#005AE0" : "#F0F0F0",
  color: isuser === "true" ? "#fff" : "#333",
  maxWidth: "100%",
  wordBreak: "break-word",
  "& pre": {
    whiteSpace: "pre-wrap",
    fontFamily: "monospace",
    fontSize: "13px",
    backgroundColor: isuser === "true" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    padding: "8px 12px",
    borderRadius: "8px",
    overflowX: "auto",
  },
  "& code": {
    fontFamily: "monospace",
    fontSize: "13px",
    backgroundColor: isuser === "true" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    padding: "2px 6px",
    borderRadius: "4px",
  },
}));

const AvatarCircle = styled(Box)<{ isuser?: string }>(({ isuser }) => ({
  width: 36,
  height: 36,
  borderRadius: "50%",
  backgroundColor: isuser === "true" ? "#005AE0" : "#4CAF50",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: "#fff",
}));

const InputContainer = styled(Box)({
  padding: "16px 20px",
  borderTop: "1px solid #E5E7EB",
  display: "flex",
  gap: "12px",
  alignItems: "flex-end",
});

const WelcomeContainer = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#6B7280",
  gap: "16px",
});

export default function ChatbotPanel() {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<ChatbotConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadConversations = useCallback(async () => {
    const res = await chatbotService.listConversations();
    if (res.ok && res.payload?.data) {
      setConversations(res.payload.data);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!activeConvId) return;
    setLoading(true);
    chatbotService.listMessages(activeConvId).then((res) => {
      if (res.ok && res.payload?.data) {
        setMessages(res.payload.data);
      }
      setLoading(false);
    });
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewConversation = async () => {
    const res = await chatbotService.createConversation();
    if (res.ok && res.payload?.data) {
      const newConv = res.payload.data;
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setMessages([]);
    }
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(t("AI.DELETE_CONVO_CONFIRM"))) return;
    await chatbotService.deleteConversation(convId);
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (activeConvId === convId) {
      setActiveConvId(null);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConvId || sending || messages.length >= 20) return;

    const userContent = input.trim();
    setInput("");

    // Optimistic UI: add user message immediately
    const tempUserMsg: ChatbotMessage = {
      id: `temp-${Date.now()}`,
      conversationId: activeConvId,
      role: "user",
      content: userContent,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setSending(true);

    const res = await chatbotService.sendMessage(activeConvId, userContent);
    setSending(false);

    if (res.ok && res.payload?.data) {
      const payloadData = res.payload.data;
      // Replace temp message with real ones
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...withoutTemp, payloadData.userMessage, payloadData.assistantMessage];
      });
      // Refresh conversation list to update title
      loadConversations();

      // Intercept Agentic Action Metadata
      const assistantMsg = payloadData.assistantMessage;
      if (assistantMsg && assistantMsg.metadata) {
        try {
          const actionObj = JSON.parse(assistantMsg.metadata);
          if (actionObj.type === "create_cloud_file" || actionObj.type === "delete_cloud_file") {
            console.log("[AI Agent] Dispatching cloud refresh event");
            window.dispatchEvent(new CustomEvent("app:refresh_cloud"));
          } else if (actionObj.type === "add_friend" || actionObj.type === "remove_friend") {
            console.log("[AI Agent] Dispatching friends refresh event");
            window.dispatchEvent(new CustomEvent("app:refresh_friends"));
          }
        } catch (e) {
          console.error("Failed to parse action metadata:", e);
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  return (
    <Root>
      <ConversationSidebar>
        <ConversationHeader>
          <Typography variant="subtitle1" fontWeight={600}>
            {t("AI.TITLE")}
          </Typography>
          <IconButton size="small" onClick={handleNewConversation} sx={{ color: "#005AE0" }}>
            <AddIcon />
          </IconButton>
        </ConversationHeader>
        <ConversationList>
          {conversations.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
              {t("AI.NO_CONVO")}
            </Typography>
          )}
          {conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              active={conv.id === activeConvId}
              onClick={() => setActiveConvId(conv.id)}
            >
              <Typography
                variant="body2"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                  fontWeight: conv.id === activeConvId ? 600 : 400,
                }}
              >
                {conv.title}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => handleDeleteConversation(conv.id, e)}
                sx={{ ml: 1, opacity: 0.5, "&:hover": { opacity: 1 } }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </ConversationItem>
          ))}
        </ConversationList>
      </ConversationSidebar>

      <ChatArea>
        {!activeConvId ? (
          <WelcomeContainer>
            <SmartToyIcon sx={{ fontSize: 64, color: "#005AE0" }} />
            <Typography variant="h6">{t("AI.WELCOME_TITLE")}</Typography>
            <Typography variant="body2" textAlign="center" maxWidth={400}>
              {t("AI.WELCOME_DESC")}
            </Typography>
          </WelcomeContainer>
        ) : (
          <>
            <ChatHeader sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <SmartToyIcon sx={{ color: "#005AE0" }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  {activeConversation?.title || t("AI.TITLE")}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: messages.length >= 20 ? "#D32F2F" : "#555555",
                  backgroundColor: messages.length >= 20 ? "#FFEBEE" : "#F5F5F5",
                  fontWeight: 600,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "12px",
                  border: messages.length >= 20 ? "1px solid #FFCDD2" : "1px solid #E0E0E0",
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: "12px",
                }}
              >
                {t("AI.CONTEXT_LIMIT", { count: messages.length })}
              </Typography>
            </ChatHeader>

            <MessagesContainer>
              {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <MessageBubble key={`${msg.id}-${index}`} isuser={msg.role === "user" ? "true" : "false"}>
                      <AvatarCircle isuser={msg.role === "user" ? "true" : "false"}>
                        {msg.role === "user" ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                      </AvatarCircle>
                      <BubbleContent elevation={0} isuser={msg.role === "user" ? "true" : "false"}>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                          {msg.content}
                        </Typography>
                        {msg.role !== "user" && msg.metadata && (
                           <ActionLinkButton metadata={msg.metadata} />
                        )}
                      </BubbleContent>
                    </MessageBubble>
                  ))}
                  {sending && (
                    <MessageBubble isuser="false">
                      <AvatarCircle isuser="false">
                        <SmartToyIcon fontSize="small" />
                      </AvatarCircle>
                      <BubbleContent elevation={0} isuser="false">
                        <Box display="flex" gap={0.5} alignItems="center" py={0.5}>
                          <CircularProgress size={16} />
                          <Typography variant="body2" color="text.secondary">
                            {t("AI.THINKING")}
                          </Typography>
                        </Box>
                      </BubbleContent>
                    </MessageBubble>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </MessagesContainer>

            <InputContainer>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder={
                  messages.length >= 20
                    ? t("AI.CONVO_LIMIT_REACHED")
                    : t("AI.TYPE_MESSAGE")
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending || messages.length >= 20}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "24px",
                    paddingRight: "8px",
                  },
                }}
              />
              <IconButton
                onClick={handleSend}
                disabled={!input.trim() || sending || messages.length >= 20}
                sx={{
                  backgroundColor: "#005AE0",
                  color: "#fff",
                  width: 40,
                  height: 40,
                  "&:hover": { backgroundColor: "#0048CC" },
                  "&.Mui-disabled": { backgroundColor: "#ccc", color: "#fff" },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </InputContainer>
          </>
        )}
      </ChatArea>
    </Root>
  );
}
