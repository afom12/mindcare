import { API } from "./api";

export const communityApi = {
  getPosts: () => API.get("/v1/community"),
  createPost: (data) => API.post("/v1/community", data),
  reportPost: (postId, reason) => API.post("/v1/community/report", { postId, reason })
};
