import { API } from "./api";

export const messagingApi = {
  getConversations: () => API.get("/v1/conversations"),
  getOrCreateConversation: (therapistId) => API.get(`/v1/conversations/with/${therapistId}`),
  getOrCreateConversationWithClient: (clientId) =>
    API.get(`/v1/conversations/with-client/${clientId}`),
  getMessages: (conversationId, params) =>
    API.get(`/v1/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, content) =>
    API.post(`/v1/conversations/${conversationId}/messages`, { content }),
  markRead: (conversationId) => API.patch(`/v1/conversations/${conversationId}/read`)
};
