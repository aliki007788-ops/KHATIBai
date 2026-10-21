import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Conversation, ConversationListItem, Message } from "@/types/chat";

export const chatService = {
  list: async () => {
    const res = await apiClient.get<ConversationListItem[]>(
      endpoints.chat.conversations
    );
    return res.data;
  },

  get: async (id: string) => {
    const res = await apiClient.get<Conversation>(endpoints.chat.conversation(id));
    return res.data;
  },

  create: async (title?: string) => {
    const res = await apiClient.post<Conversation>(endpoints.chat.conversations, {
      title: title || null,
    });
    return res.data;
  },

  sendMessage: async (conversationId: string, text: string) => {
    const res = await apiClient.post<Message>(
      endpoints.chat.messages(conversationId),
      { text }
    );
    return res.data;
  },

  remove: async (id: string) => {
    await apiClient.delete(endpoints.chat.conversation(id));
  },
};
