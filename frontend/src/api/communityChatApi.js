import { API } from "./api";

export const communityChatApi = {
  getGroups: () => API.get("/v1/community-chat/groups"),
  joinGroup: (groupId) => API.post(`/v1/community-chat/groups/${groupId}/join`),
  leaveGroup: (groupId) => API.post(`/v1/community-chat/groups/${groupId}/leave`),
  getGroupMessages: (groupId, params) =>
    API.get(`/v1/community-chat/groups/${groupId}/messages`, { params }),
  sendGroupMessage: (groupId, data) =>
    API.post(`/v1/community-chat/groups/${groupId}/messages`, data),
  getGroupMembers: (groupId) => API.get(`/v1/community-chat/groups/${groupId}/members`),

  getPeerConversations: () => API.get("/v1/community-chat/peer/conversations"),
  getOrCreatePeerConversation: (userId) =>
    API.get(`/v1/community-chat/peer/conversations/with/${userId}`),
  getPeerMessages: (conversationId, params) =>
    API.get(`/v1/community-chat/peer/conversations/${conversationId}/messages`, { params }),
  sendPeerMessage: (conversationId, data) =>
    API.post(`/v1/community-chat/peer/conversations/${conversationId}/messages`, data),

  blockUser: (blockedUserId) => API.post("/v1/community-chat/block", { blockedUserId }),
  unblockUser: (blockedUserId) => API.delete(`/v1/community-chat/block/${blockedUserId}`),
  getBlockedUsers: () => API.get("/v1/community-chat/blocked"),
  reportUser: (reportedUserId, reason) =>
    API.post("/v1/community-chat/report-user", { reportedUserId, reason })
};
