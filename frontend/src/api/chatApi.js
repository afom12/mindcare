import { API } from "./api";

export const ANON_SESSION_KEY = "mindcare_anon_session";

export const getAnonymousSessionId = () => {
  let id = localStorage.getItem(ANON_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_SESSION_KEY, id);
  }
  return id;
};

export const chatApi = {
  sendMessage: (message, recentMood) =>
    API.post("/v1/ai/chat", { message, recentMood: recentMood || undefined }),
  getChatHistory: () => API.get("/v1/ai/chat"),

  sendAnonymousMessage: (message) => {
    const sessionId = getAnonymousSessionId();
    return API.post("/v1/ai/chat/anonymous", { message }, {
      headers: { "X-Anonymous-Session": sessionId }
    });
  },
  getAnonymousChatHistory: () => {
    const sessionId = getAnonymousSessionId();
    return API.get("/v1/ai/chat/anonymous", {
      headers: { "X-Anonymous-Session": sessionId }
    });
  },
  migrateChat: (sessionId) => API.post("/v1/ai/chat/migrate", { sessionId })
};
