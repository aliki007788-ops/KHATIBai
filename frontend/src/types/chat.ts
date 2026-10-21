/** Aligned with backend app/schemas/chat.py */

export interface Message {
  id: string;
  role: "user" | "assistant" | string;
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface ConversationListItem {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}
