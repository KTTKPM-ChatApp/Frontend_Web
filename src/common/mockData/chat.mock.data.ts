import type {
  ConversationDto,
  UiMessage,
} from "@/src/common/interface/chat-interface";

const now = Date.now();

export const mockConversations: ConversationDto[] = [
  {
    id: "c1",
    name: "Nguyễn Văn A",
    avatarUrl: "https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg",
    type: "direct",
    unreadCount: 2,
    isMuted: false,
    lastMessage: {
      id: "lm1",
      content: "Tối nay học nhóm không?",
      createdAt: now - 1000 * 60 * 3,
      senderId: "user_a",
      senderName: "Nguyễn Văn A",
    },
    lastMessageAt: now - 1000 * 60 * 3,
    createdAt: new Date(now - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "c2",
    name: "Nhóm SE Nhóm 5",
    avatarUrl: "https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg",
    type: "group",
    memberCount: 5,
    unreadCount: 5,
    isMuted: false,
    lastMessage: {
      id: "lm2",
      content: "Mai nhớ nộp bản final nhé",
      createdAt: now - 1000 * 60 * 15,
      senderId: "user_b",
      senderName: "Thành viên B",
    },
    lastMessageAt: now - 1000 * 60 * 15,
    createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "c3",
    name: "Thiết kế UI",
    avatarUrl: "https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg",
    type: "group",
    memberCount: 3,
    unreadCount: 0,
    isMuted: false,
    lastMessage: {
      id: "lm3",
      content: "Mình đã update Figma rồi",
      createdAt: now - 1000 * 60 * 45,
      senderId: "user_c",
      senderName: "Thành viên C",
    },
    lastMessageAt: now - 1000 * 60 * 45,
    createdAt: new Date(now - 1000 * 60 * 120).toISOString(),
  },
];

export const mockMessagesByConversation: Record<string, UiMessage[]> = {
  c1: [
    {
      messageId: "m1",
      conversationId: "c1",
      senderId: "user_a",
      body: "Chào bạn",
      createdAt: now - 1000 * 60 * 20,
      attachments: [],
      isDeleted: false,
    },
    {
      messageId: "m2",
      conversationId: "c1",
      senderId: "me",
      body: "Chào nè, có gì không?",
      createdAt: now - 1000 * 60 * 18,
      attachments: [],
      isDeleted: false,
    },
    {
      messageId: "m3",
      conversationId: "c1",
      senderId: "user_a",
      body: "Tối nay học nhóm không?",
      createdAt: now - 1000 * 60 * 3,
      attachments: [],
      isDeleted: false,
    },
  ],

  c2: [
    {
      messageId: "m4",
      conversationId: "c2",
      senderId: "leader",
      body: "Mai nhớ nộp bản final nhé",
      createdAt: now - 1000 * 60 * 30,
      attachments: [],
      isDeleted: false,
    },
    {
      messageId: "m5",
      conversationId: "c2",
      senderId: "me",
      body: "Ok mọi người, mình đang check lại tài liệu",
      createdAt: now - 1000 * 60 * 25,
      attachments: [],
      isDeleted: false,
    },
    {
      messageId: "m6",
      conversationId: "c2",
      senderId: "member_2",
      body: "Mình gửi ảnh demo ở đây nhé",
      createdAt: now - 1000 * 60 * 22,
      attachments: [
        {
          key: "img-1",
          type: "image",
          name: "demo-homepage.png",
          size: 1024,
          contentType: "image/png",
          url: "https://via.placeholder.com/300x180.png?text=Demo+Homepage",
        },
      ],
      isDeleted: false,
    },
  ],

  c3: [
    {
      messageId: "m7",
      conversationId: "c3",
      senderId: "designer",
      body: "Mình đã update Figma rồi",
      createdAt: now - 1000 * 60 * 45,
      attachments: [],
      isDeleted: false,
    },
    {
      messageId: "m8",
      conversationId: "c3",
      senderId: "me",
      body: "Ok để mình review",
      createdAt: now - 1000 * 60 * 40,
      attachments: [],
      isDeleted: false,
    },
    {
      messageId: "m9",
      conversationId: "c3",
      senderId: "designer",
      body: "",
      createdAt: now - 1000 * 60 * 35,
      attachments: [],
      isDeleted: true,
    },
  ],
};