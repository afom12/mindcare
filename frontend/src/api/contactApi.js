import { API } from "./api";

export const contactApi = {
  submit: (data) => API.post("/v1/contact", data)
};
