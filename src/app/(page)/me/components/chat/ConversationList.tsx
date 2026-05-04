"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { openConversation } from "@/src/common/action/chat.action";
import { useAuthStore } from "@/src/common/store/useAuthStore";
import { useChatStore } from "@/src/common/store/useChatStore";
import ConversationListItem from "./ConversationListItem";

const Root = styled(Box)({
  width: "100%",
  height: "100%",
  overflow: "hidden",
  display: "flex",
  minHeight: 0,
});

const ListWrap = styled(Box)({
  flex: 1,
  minWidth: 0,
  height: "100%",
  overflowY: "auto",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  gap: 8,

  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
});

const ScrollbarWrap = styled(Box)({
  width: 8,
  height: "100%",
  flexShrink: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "stretch",
});

const ScrollbarTrack = styled(Box)({
  width: 6,
  height: "100%",
  position: "relative",
  background: "transparent",
});

const ScrollbarThumb = styled(Box, {
  shouldForwardProp: (prop) => prop !== "visible" && prop !== "dragging",
})<{ visible?: boolean; dragging?: boolean }>(({ visible, dragging }) => ({
  position: "absolute",
  left: 0,
  width: "100%",
  borderRadius: 999,
  background: "#C7CDD4",
  opacity: visible || dragging ? 1 : 0,
  transition: dragging ? "none" : "opacity 0.2s ease",
  cursor: "pointer",
}));

const StateWrap = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
  gap: 12,
});

const StateText = styled(Typography)({
  fontSize: 13,
  color: "#6B7280",
});

const MIN_THUMB_HEIGHT = 36;

export default function ConversationList() {
  const currentUserId = useAuthStore((s) => s.authData?.data?.user?.id);

  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const listConversation = useChatStore((s) => s.listConversation);
  const conversationFetched = useChatStore((s) => s.conversationFetched);
  const fetchListConversation = useChatStore((s) => s.fetchListConversation);

  const listRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const scrollHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dragStateRef = useRef<{
    startY: number;
    startTop: number;
  } | null>(null);

  const [showScrollbar, setShowScrollbar] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);

  useEffect(() => {
    fetchListConversation({ page: 1, limit: 10 });
  }, [fetchListConversation]);

  const handleOpenConversation = useCallback(
    (conversationId: string) => {
      if (conversationId === activeConversationId) return;
      openConversation(conversationId);
    },
    [activeConversationId]
  );

  const showScrollbarTemporarily = useCallback(() => {
    setShowScrollbar(true);

    if (scrollHideTimeoutRef.current) {
      clearTimeout(scrollHideTimeoutRef.current);
    }

    scrollHideTimeoutRef.current = setTimeout(() => {
      setShowScrollbar(false);
    }, 800);
  }, []);

  const syncThumbFromScroll = useCallback(() => {
    const listEl = listRef.current;
    const trackEl = trackRef.current;
    if (!listEl || !trackEl) return;

    const { scrollTop, scrollHeight, clientHeight } = listEl;
    const trackHeight = trackEl.clientHeight;

    if (scrollHeight <= clientHeight || trackHeight <= 0) {
      setThumbHeight(0);
      setThumbTop(0);
      return;
    }

    const nextThumbHeight = Math.max(
      (clientHeight / scrollHeight) * trackHeight,
      MIN_THUMB_HEIGHT
    );

    const maxThumbTop = trackHeight - nextThumbHeight;
    const maxScrollTop = scrollHeight - clientHeight;
    const nextThumbTop =
      maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

    setThumbHeight(nextThumbHeight);
    setThumbTop(nextThumbTop);
  }, []);

  const handleScroll = useCallback(() => {
    syncThumbFromScroll();
    showScrollbarTemporarily();
  }, [showScrollbarTemporarily, syncThumbFromScroll]);

  useEffect(() => {
    syncThumbFromScroll();
  }, [listConversation, syncThumbFromScroll]);

  useEffect(() => {
    const handleResize = () => {
      syncThumbFromScroll();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [syncThumbFromScroll]);

  const handleThumbMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      dragStateRef.current = {
        startY: event.clientY,
        startTop: thumbTop,
      };

      setDragging(true);
      setShowScrollbar(true);
    },
    [thumbTop]
  );

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!dragStateRef.current) return;

      const listEl = listRef.current;
      const trackEl = trackRef.current;
      if (!listEl || !trackEl) return;

      const { startY, startTop } = dragStateRef.current;
      const deltaY = event.clientY - startY;

      const trackHeight = trackEl.clientHeight;
      const maxThumbTop = trackHeight - thumbHeight;
      const nextThumbTop = Math.min(
        Math.max(startTop + deltaY, 0),
        maxThumbTop
      );

      const maxScrollTop = listEl.scrollHeight - listEl.clientHeight;
      const nextScrollTop =
        maxThumbTop > 0 ? (nextThumbTop / maxThumbTop) * maxScrollTop : 0;

      listEl.scrollTop = nextScrollTop;
      setThumbTop(nextThumbTop);
    };

    const handleMouseUp = () => {
      dragStateRef.current = null;
      setDragging(false);
      showScrollbarTemporarily();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [thumbHeight, showScrollbarTemporarily]);

  useEffect(() => {
    return () => {
      if (scrollHideTimeoutRef.current) {
        clearTimeout(scrollHideTimeoutRef.current);
      }
    };
  }, []);

  const hasScrollableContent = useMemo(() => thumbHeight > 0, [thumbHeight]);

  if (!conversationFetched) {
    return (
      <Root>
        <ListWrap ref={listRef} onScroll={handleScroll}>
          <StateWrap>
            <CircularProgress size={20} />
            <StateText>Đang tải danh sách cuộc trò chuyện...</StateText>
          </StateWrap>
        </ListWrap>

        <ScrollbarWrap>
          <ScrollbarTrack ref={trackRef} />
        </ScrollbarWrap>
      </Root>
    );
  }

  if (listConversation.length === 0) {
    return (
      <Root>
        <ListWrap ref={listRef} onScroll={handleScroll}>
          <StateWrap>
            <StateText>Chưa có cuộc trò chuyện nào</StateText>
          </StateWrap>
        </ListWrap>

        <ScrollbarWrap>
          <ScrollbarTrack ref={trackRef} />
        </ScrollbarWrap>
      </Root>
    );
  }

  return (
    <Root>
      <ListWrap ref={listRef} onScroll={handleScroll}>
        {listConversation.map((item) => (
          <ConversationListItem
            key={item.id}
            item={item}
            active={activeConversationId === item.id}
            currentUserId={currentUserId}
            onOpen={handleOpenConversation}
          />
        ))}
      </ListWrap>

      <ScrollbarWrap>
        <ScrollbarTrack ref={trackRef}>
          {hasScrollableContent && (
            <ScrollbarThumb
              visible={showScrollbar}
              dragging={dragging}
              onMouseDown={handleThumbMouseDown}
              sx={{
                height: thumbHeight,
                transform: `translateY(${thumbTop}px)`,
              }}
            />
          )}
        </ScrollbarTrack>
      </ScrollbarWrap>
    </Root>
  );
}