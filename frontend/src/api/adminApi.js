import { API } from "./api";

export const adminApi = {
  getUsers: (params) => API.get("/v1/admin/users", { params }),
  getUser: (id) => API.get(`/v1/admin/users/${id}`),
  getStats: () => API.get("/v1/admin/stats"),
  updateUserRole: (userId, role) => API.patch(`/v1/admin/users/${userId}/role`, { role }),
  updateUserStatus: (userId, status) => API.put(`/v1/admin/users/${userId}/status`, { status }),

  getPosts: (params) => API.get("/v1/admin/posts", { params }),
  getPendingPosts: () => API.get("/v1/admin/pending-posts"),
  approvePost: (id) => API.post(`/v1/admin/posts/${id}/approve`),
  rejectPost: (id) => API.post(`/v1/admin/posts/${id}/reject`),
  deletePost: (id) => API.delete(`/v1/admin/posts/${id}`),

  getReports: (params) => API.get("/v1/admin/reports", { params }),
  resolveReport: (id, data) => API.post(`/v1/admin/reports/${id}/resolve`, data),

  getUserReports: (params) => API.get("/v1/community-chat/moderation/user-reports", { params }),
  resolveUserReport: (reportId, data) =>
    API.put(`/v1/community-chat/moderation/user-reports/${reportId}/resolve`, data),

  getCrisisAlerts: (params) => API.get("/v1/admin/crisis-alerts", { params }),

  getPendingTherapists: () => API.get("/v1/admin/pending-therapists"),
  verifyTherapist: (id) => API.post(`/v1/admin/therapists/${id}/verify`),
  rejectTherapist: (id, data) => API.post(`/v1/admin/therapists/${id}/reject`, data),

  getResources: (params) => API.get("/v1/admin/resources", { params }),
  createResource: (data) => API.post("/v1/admin/resources", data),
  updateResource: (id, data) => API.patch(`/v1/admin/resources/${id}`, data),
  deleteResource: (id) => API.delete(`/v1/admin/resources/${id}`),

  getHealth: () => API.get("/v1/admin/health"),
  getAnalytics: () => API.get("/v1/admin/analytics")
};
