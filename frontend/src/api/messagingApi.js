import { API } from "./api";

export const messagingApi = {
  getConversations: () => API.get("/v1/conversations"),
  getOrCreateConversation: (therapistId) => API.get(`/v1/conversations/with/${therapistId}`),
  getMessages: (conversationId, params) =>
    API.get(`/v1/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, content) =>
    API.post(`/v1/conversations/${conversationId}/messages`, { content }),
  markRead: (conversationId) => API.patch(`/v1/conversations/${conversationId}/read`)
};
