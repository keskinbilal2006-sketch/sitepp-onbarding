import type { UserRole } from '../../middleware/auth.middleware.js';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  apartmentNo?: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshInput {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  apartmentNo: string | null;
  phone: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: PublicUser;
  tokens: AuthTokens;
}