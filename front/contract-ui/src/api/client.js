import axios from "axios";
import { clearSession } from "./session";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api/aicontract";
const client = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshPromise = null;

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";
    const isAuthRequest =
      url.includes("/auth/") || url.endsWith("/auth/refresh") || url.endsWith("/auth/logout");

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      clearSession();
      window.location.assign("/login");
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${baseURL}/auth/refresh`, { refreshToken }, { withCredentials: true })
          .then(({ data }) => {
            if (!data?.accessToken || !data?.refreshToken) {
              throw new Error("토큰 재발급 응답이 올바르지 않습니다.");
            }
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            return data.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const accessToken = await refreshPromise;
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return client(originalRequest);
    } catch (refreshError) {
      clearSession();
      window.location.assign("/login");
      return Promise.reject(refreshError);
    }
  },
);

export default client;
