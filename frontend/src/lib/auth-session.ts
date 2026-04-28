import type { AuthTokens, PublicUser, UserRole } from '../types';

const ACCESS_TOKEN_KEY = 'sitepp_access_token';
const REFRESH_TOKEN_KEY = 'sitepp_refresh_token';
const USER_ROLE_KEY = 'sitepp_user_role';
const USER_NAME_KEY = 'sitepp_user_name';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

/**
 * Login/Register sonrasi token ve role bilgisi tarayicida saklanir.
 */
export function saveAuthSession(tokens: AuthTokens, user: PublicUser): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(USER_ROLE_KEY, user.role);
  localStorage.setItem(USER_NAME_KEY, user.name);

  // Middleware'in route guard yapabilmesi icin cookie de yaziyoruz.
  setCookie('sitepp_access_token', tokens.accessToken, 60 * 60 * 24 * 7);
  setCookie('sitepp_user_role', user.role, 60 * 60 * 24 * 7);
}

export function clearAuthSession(): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_NAME_KEY);

  clearCookie('sitepp_access_token');
  clearCookie('sitepp_user_role');
}

export function getAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) {
    return null;
  }
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredRole(): UserRole | null {
  if (!isBrowser()) {
    return null;
  }
  const role = localStorage.getItem(USER_ROLE_KEY);
  if (role === 'ADMIN' || role === 'STAFF' || role === 'RESIDENT') {
    return role;
  }
  return null;
}

export function getStoredUserName(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(USER_NAME_KEY);
}
