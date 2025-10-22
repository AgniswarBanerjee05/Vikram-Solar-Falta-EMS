import type { NavigateFunction } from 'react-router-dom';
import { STORAGE_KEYS } from '../lib/config';

export type UserRole = 'user' | 'admin';

export interface SessionData {
  role: UserRole;
  token: string;
}

const SESSION_STORAGE_KEY = 'falta.session';

const isSessionData = (value: unknown): value is SessionData => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const role = candidate.role;
  const token = candidate.token;
  const validRole = role === 'user' || role === 'admin';
  return validRole && typeof token === 'string' && token.length > 0;
};

export const getSession = (): SessionData | null => {
  try {
    // Use sessionStorage (clears when browser/tab closes)
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    return isSessionData(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const setSession = (session: SessionData): void => {
  // Use sessionStorage so it clears when browser closes
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearSession = (): void => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEYS.adminToken);
  sessionStorage.removeItem(STORAGE_KEYS.adminEmail);
  // Also clear from localStorage in case old sessions exist
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEYS.adminToken);
  localStorage.removeItem(STORAGE_KEYS.adminEmail);
};

export const isAuthed = (requiredRole?: UserRole): boolean => {
  const session = getSession();
  if (!session) {
    return false;
  }
  if (!requiredRole) {
    return !!session.token;
  }
  return session.role === requiredRole && !!session.token;
};

export const logout = (navigate?: NavigateFunction): void => {
  clearSession();
  if (navigate) {
    navigate('/login', { replace: true });
    return;
  }
  window.location.assign('/login');
};

export const __session = {
  key: SESSION_STORAGE_KEY
};
