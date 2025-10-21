const normalizeUrl = (value: string | undefined, fallback: string) => {
  const url = (value ?? fallback).trim();
  if (!url) return fallback;
  return url.replace(/\/+$/, '');
};

export const USER_API_BASE_URL = normalizeUrl(
  import.meta.env.VITE_USER_API_URL,
  'http://localhost:5000'
);

export const ADMIN_API_BASE_URL = normalizeUrl(
  import.meta.env.VITE_ADMIN_API_URL,
  'http://localhost:4000'
);

export const STORAGE_KEYS = {
  authToken: 'falta-ems-auth-token',
  adminToken: 'falta-ems-admin-token',
  adminEmail: 'falta-ems-admin-email'
};

export const buildUserApiUrl = (path: string) => {
  if (!path.startsWith('/')) {
    return `${USER_API_BASE_URL}/${path}`;
  }
  return `${USER_API_BASE_URL}${path}`;
};

export const buildAdminApiUrl = (path: string) => {
  if (!path.startsWith('/')) {
    return `${ADMIN_API_BASE_URL}/${path}`;
  }
  return `${ADMIN_API_BASE_URL}${path}`;
};

export const LEAD_ADMIN_EMAIL = (
  import.meta.env.VITE_LEAD_ADMIN_EMAIL ?? 'agniswar.banerjee@vikramsolar.com'
).toLowerCase();
