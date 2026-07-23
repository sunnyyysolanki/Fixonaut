import axios from "axios";

import { useAuthStore } from "@/stores/auth-store";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken =
    useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization =
      `Bearer ${accessToken}`;
  }

  return config;
});

type RefreshResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: any;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<RefreshResponse>(
        "/auth/refresh",
        {},
        { withCredentials: true },
      )
      .then((response) => {
        useAuthStore.getState().setAuth(
          response.data.user,
          response.data.accessToken,
        );

        return response.data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/refresh")) {
        useAuthStore.getState().setSessionExpired();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } else {
        useAuthStore.getState().setSessionExpired();
      }
    }

    return Promise.reject(error);
  },
);