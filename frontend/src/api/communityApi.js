import { API } from "./api";

export const REACTION_EMOJIS = { heart: "❤️", pray: "🙏", sprout: "🌱", hug: "🫂" };

export const communityApi = {
  getGroups: () => API.get("/v1/community/groups"),
  getPosts: (params) => API.get("/v1/community", { params }),
  createPost: (data) => API.post("/v1/community", data),
  reportPost: (postId, reason) => API.post("/v1/community/report", { postId, reason }),
  getPostComments: (postId) => API.get(`/v1/community/posts/${postId}/comments`),
  addComment: (postId, content) => API.post(`/v1/community/posts/${postId}/comments`, { content }),
  togglePostReaction: (postId, emoji) =>
    API.post(`/v1/community/posts/${postId}/reactions`, { emoji }),
  toggleCommentReaction: (postId, commentId, emoji) =>
    API.post(`/v1/community/posts/${postId}/comments/${commentId}/reactions`, { emoji })
};
