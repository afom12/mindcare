import { API } from "./api";

export const notificationApi = {
  getNotifications: () => API.get("/v1/notifications"),
  getUnreadCount: () => API.get("/v1/notifications/unread-count"),
  markAsRead: (id) => API.patch(`/v1/notifications/${id}/read`),
  markAllAsRead: () => API.patch("/v1/notifications/read-all")
};
