import type { ConversationDto, UiMessage } from "@/src/common/interface/chat-interface";

const LINK_REGEX = /(https?:\/\/[^\s]+)/g;

export const uniqAttachments = <T extends Record<string, any>>(items: T[]) => {
  const map = new Map<string, T>();

  for (const item of items) {
    const key =
      item?.key ||
      item?.url ||
      item?.thumbnailUrl ||
      `${item?.name || "file"}-${item?.size || 0}`;

    if (!map.has(String(key))) {
      map.set(String(key), item);
    }
  }

  return Array.from(map.values());
};

export const uniqStrings = (items: string[]) => Array.from(new Set(items));

export const extractMediaFromMessage = (message: Partial<UiMessage>) => {
  const attachments = Array.isArray(message?.attachments)
    ? message.attachments
    : [];

  return attachments.filter(
    (att: any) => att?.type === "image" || att?.type === "video"
  );
};

export const extractFilesFromMessage = (message: Partial<UiMessage>) => {
  const attachments = Array.isArray(message?.attachments)
    ? message.attachments
    : [];

  return attachments.filter((att: any) => att?.type === "document");
};

export const extractLinksFromMessage = (message: Partial<UiMessage>) => {
  const body = message?.body || "";
  return body.match(LINK_REGEX) || [];
};

export const normalizeMessage = (raw: any): UiMessage & {
  clientMessageId?: string | null;
  errorMessage?: string | null;
} => {
  const senderId =
    raw?.senderId ??
    raw?.sender_id ??
    "";

  const messageId =
    raw?.messageId ??
    raw?.message_id ??
    raw?.id ??
    `msg-${Date.now()}-${Math.random()}`;

  const conversationId =
    raw?.conversationId ??
    raw?.conversation_id ??
    "";

  const rawCreatedAt =
    raw?.createdAt ??
    raw?.created_at ??
    raw?.sent_at ??
    Date.now();

  const createdAt =
    typeof rawCreatedAt === "string"
      ? new Date(rawCreatedAt).getTime()
      : Number(rawCreatedAt);

  // Map replyTo object if it exists in the raw data (from API response or optimistic)
  const rawReply = raw?.replyTo;
  const replyTo = rawReply
    ? {
        messageId: rawReply.messageId || rawReply.id || "",
        senderId: rawReply.senderId || rawReply.sender?.id || "",
        senderName:
          rawReply.senderName ||
          rawReply.sender?.displayName ||
          rawReply.sender?.fullName ||
          rawReply.sender?.name ||
          "Người dùng",
        body: rawReply.body || rawReply.content || "",
        attachments: Array.isArray(rawReply.attachments) ? rawReply.attachments : [],
        isDeleted: Boolean(rawReply.isDeleted),
      }
    : null;

  return {
    messageId: String(messageId),
    clientMessageId: raw?.clientMessageId ?? raw?.client_message_id ?? null,
    conversationId: String(conversationId),
    senderId: String(senderId),
    senderName: raw?.senderName ?? raw?.sender_name ?? undefined,
    body: raw?.body ?? raw?.content ?? "",
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
    attachments: Array.isArray(raw?.attachments) ? raw.attachments : [],
    replyTo,
    replyToMessageId:
      raw?.replyToMessageId ??
      raw?.reply_to_message_id ??
      raw?.reply_to_id ??
      rawReply?.messageId ??
      rawReply?.id ??
      null,
    editedAt: raw?.editedAt ?? raw?.edited_at ?? null,
    deletedAt: raw?.deletedAt ?? raw?.deleted_at ?? null,
    isDeleted: Boolean(raw?.isDeleted ?? raw?.is_deleted ?? false),
    pending: Boolean(raw?.pending ?? false),
    failed: Boolean(raw?.failed ?? false),
    errorMessage: raw?.errorMessage ?? null,
  };
};

export const sortMessages = (items: UiMessage[]) =>
  [...items].sort((a, b) => Number(a.createdAt) - Number(b.createdAt));

export const dedupeByMessageId = (items: any[]) => {
  const map = new Map<string, any>();

  for (const item of items) {
    const msg = normalizeMessage(item);
    const key = String(msg.messageId);
    map.set(key, {
      ...(map.get(key) || {}),
      ...msg,
    });
  }

  return sortMessages(Array.from(map.values()));
};

export const upsertIncomingMessage = (items: any[], raw: any) => {
  const incoming = normalizeMessage(raw);

  const existedIndex = items.findIndex(
    (msg: any) =>
      msg.messageId === incoming.messageId ||
      (incoming.clientMessageId &&
        msg.clientMessageId === incoming.clientMessageId)
  );

  if (existedIndex === -1) {
    return dedupeByMessageId([...items, incoming]);
  }

  const next = [...items];
  next[existedIndex] = {
    ...next[existedIndex],
    ...incoming,
    pending: false,
    failed: false,
  };

  return dedupeByMessageId(next);
};

export const buildDerivedDataFromMessages = (messages: any[]) => {
  const media: any[] = [];
  const files: any[] = [];
  const links: string[] = [];

  for (const raw of messages) {
    const msg = normalizeMessage(raw);
    if (msg?.isDeleted) continue;

    media.push(...extractMediaFromMessage(msg));
    files.push(...extractFilesFromMessage(msg));
    links.push(...extractLinksFromMessage(msg));
  }

  return {
    media: uniqAttachments(media),
    files: uniqAttachments(files),
    links: uniqStrings(links),
  };
};
