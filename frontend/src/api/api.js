import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const API = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url || "";
      const softEndpoints = ["/notifications", "/mood"];
      const isSoft = softEndpoints.some((e) => url.includes(e));
      if (isSoft) {
        return Promise.reject(err);
      }
      const isAuthPage = window.location.pathname === "/login" || window.location.pathname === "/register";
      if (!isAuthPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        const from = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = from ? `/login?from=${from}` : "/login";
      }
    }
    return Promise.reject(err);
  }
);
