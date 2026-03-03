import { API } from "./api";

export const communityChatModerationApi = {
  getGroups: () => API.get("/v1/community-chat/moderation/groups"),
  getGroupMessages: (groupId) =>
    API.get(`/v1/community-chat/moderation/groups/${groupId}/messages`),
  flagGroupMessage: (messageId, reason) =>
    API.put(`/v1/community-chat/moderation/group-messages/${messageId}/flag`, { reason }),
  hideGroupMessage: (messageId) =>
    API.put(`/v1/community-chat/moderation/group-messages/${messageId}/hide`),

  getPeerConversations: () => API.get("/v1/community-chat/moderation/peer/conversations"),
  getPeerMessages: (conversationId) =>
    API.get(`/v1/community-chat/moderation/peer/conversations/${conversationId}/messages`),
  flagPeerMessage: (messageId, reason) =>
    API.put(`/v1/community-chat/moderation/peer-messages/${messageId}/flag`, { reason }),
  hidePeerMessage: (messageId) =>
    API.put(`/v1/community-chat/moderation/peer-messages/${messageId}/hide`),

  getUserReports: (params) => API.get("/v1/community-chat/moderation/user-reports", { params }),
  resolveUserReport: (reportId, data) =>
    API.put(`/v1/community-chat/moderation/user-reports/${reportId}/resolve`, data)
};
