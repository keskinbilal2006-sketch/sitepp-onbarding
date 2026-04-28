import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { clearAuthSession, getAccessToken, getRefreshToken, saveAuthSession } from './auth-session';
import type { ApiErrorPayload, AuthResponse } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * Tum HTTP cagrilarini tek noktadan yonetiyoruz.
 */
export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('Refresh token bulunamadi.');
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<AuthResponse>(`${API_URL}/api/auth/refresh`, { refreshToken })
      .then((response) => {
        saveAuthSession(response.data.tokens, response.data.user);
        return response.data.tokens.accessToken;
      })
      .catch((error) => {
        clearAuthSession();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const path = originalRequest.url ?? '';
    const isAuthEndpoint =
      path.includes('/auth/login') || path.includes('/auth/register') || path.includes('/auth/refresh');

    if (status !== 401 || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    try {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAuthSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    }
  }
);

/**
 * Backend hata mesajini UI'da gostermek icin okunur hale getirir.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data?.message ?? error.message ?? 'Bilinmeyen API hatasi.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Bilinmeyen hata.';
}
