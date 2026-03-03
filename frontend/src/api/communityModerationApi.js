import { API } from "./api";

export const communityModerationApi = {
  getQueue: (params) => API.get("/v1/community/moderation", { params }),
  approvePost: (postId) => API.put(`/v1/community/moderation/posts/${postId}/approve`),
  rejectPost: (postId, reason) => API.put(`/v1/community/moderation/posts/${postId}/reject`, { reason }),
  getPostComments: (postId) => API.get(`/v1/community/moderation/posts/${postId}/comments`),
  addComment: (postId, content) =>
    API.post(`/v1/community/moderation/posts/${postId}/comments`, { content }),
  pinComment: (postId, commentId) =>
    API.put(`/v1/community/moderation/posts/${postId}/comments/${commentId}/pin`),
  unpinComment: (postId) => API.delete(`/v1/community/moderation/posts/${postId}/pin`),
  getReports: () => API.get("/v1/community/moderation/reports"),
  resolveReport: (reportId, action, note) =>
    API.put(`/v1/community/moderation/reports/${reportId}/resolve`, { action, note })
};
