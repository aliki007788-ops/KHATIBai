/** Exact paths matching backend routers */

export const endpoints = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    me: "/api/auth/me",
    refresh: "/api/auth/refresh",
    logout: "/api/auth/logout",
  },
  progress: {
    summary: "/api/progress/summary",
    trends: "/api/progress/trends",
  },
  learning: {
    daily: "/api/learning/daily-recommendation",
    levels: "/api/learning/levels",
    scenarios: (levelId: string) => `/api/learning/levels/${levelId}/scenarios`,
    start: (scenarioId: string) => `/api/learning/scenarios/${scenarioId}/start`,
    complete: (scenarioId: string) => `/api/learning/scenarios/${scenarioId}/complete`,
  },
  chat: {
    conversations: "/api/chat/conversations",
    conversation: (id: string) => `/api/chat/conversations/${id}`,
    messages: (id: string) => `/api/chat/conversations/${id}/messages`,
  },
  speech: {
    audio: "/api/speech/audio",
    text: "/api/speech/text",
    list: "/api/speech",
    detail: (id: string) => `/api/speech/${id}`,
  },
  billing: {
    subscription: "/api/billing/subscription",
    history: "/api/billing/history",
    checkout: "/api/billing/checkout",
    // callback is server-side redirect from ZarinPal — not called from SPA
  },
  eitaa: {
    linkStatus: "/api/eitaa/link-status",
  },
  privacy: {
    export: "/api/privacy/export",
    deleteAccount: "/api/privacy/delete-account",
  },
  admin: {
    stats: "/api/admin/stats",
    users: "/api/admin/users",
    user: (id: string) => `/api/admin/users/${id}`,
    transactions: "/api/admin/transactions",
    subscriptions: "/api/admin/subscriptions",
    audit: "/api/admin/audit",
  },
} as const;
