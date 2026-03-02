import { API } from "./api";

export const loginUser = (data) => API.post("/v1/auth/login", data);

export const registerUser = (data) => API.post("/v1/auth/register", data);

export const registerTherapist = (formData) =>
  API.post("/v1/auth/register/therapist", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const forgotPassword = (data) => API.post("/v1/auth/forgot-password", data);

export const resetPassword = (token, data) => API.post(`/v1/auth/reset-password/${token}`, data);

export const updateProfile = (data) => API.patch("/v1/auth/profile", data);
