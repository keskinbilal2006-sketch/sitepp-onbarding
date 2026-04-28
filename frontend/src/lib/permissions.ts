import type { UserRole } from '../types';

/**
 * Frontend tarafinda gorunurluk ve route kontrolu icin basit helper.
 */
export function canAccessRoute(role: UserRole | null, pathname: string): boolean {
  if (!role) {
    return false;
  }

  if (pathname.startsWith('/staff') || pathname.startsWith('/reports')) {
    return role === 'ADMIN';
  }

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/tasks')) {
    return role === 'ADMIN' || role === 'STAFF' || role === 'RESIDENT';
  }

  return true;
}
