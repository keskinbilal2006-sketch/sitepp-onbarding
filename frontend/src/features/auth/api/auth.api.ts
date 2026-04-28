import { apiClient } from '../../../lib/api-client';
import type { AuthResponse, PublicUser } from '../../../types';

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  apartmentNo?: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  me: async (): Promise<PublicUser> => {
    const { data } = await apiClient.get<PublicUser>('/auth/me');
    return data;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    return data;
  },

  logout: async (refreshToken: string): Promise<{ success: true }> => {
    const { data } = await apiClient.post<{ success: true }>('/auth/logout', { refreshToken });
    return data;
  },
};
