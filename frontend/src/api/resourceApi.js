import { API } from "./api";

export const resourceApi = {
  getResources: (params) => API.get("/v1/resources", { params }),
  toggleFavorite: (resourceId) => API.post("/v1/resources/favorite", { resourceId }),
  getFavorites: () => API.get("/v1/resources/favorites")
};
