/**
 * Projede ortak kullanilan temel tipler.
 */
export type UserRole = 'RESIDENT' | 'STAFF' | 'ADMIN';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  apartmentNo: string | null;
  phone: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: PublicUser;
  tokens: AuthTokens;
}

export interface ApiErrorPayload {
  error?: string;
  message?: string;
  statusCode?: number;
  details?: unknown;
}
