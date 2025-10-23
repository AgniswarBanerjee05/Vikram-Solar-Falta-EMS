import { buildAdminApiUrl, buildUserApiUrl } from './config';

export interface AdminUser {
  id: number;
  email: string;
  full_name?: string | null;
  status: 'ACTIVE' | 'DISABLED';
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  created_by_email?: string | null;
  plain_password?: string | null;
}

export interface AdminCredentials {
  email: string;
  password: string;
  fullName?: string;
}

export interface CreateUserPayload {
  email: string;
  fullName?: string;
  password?: string;
}

export interface UpdateUserPayload {
  email?: string;
  fullName?: string;
  status?: 'ACTIVE' | 'DISABLED';
}

async function handleJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }
  try {
    const data = await response.json();
    const message = typeof data?.error === 'string' ? data.error : fallbackMessage;
    throw new Error(message);
  } catch (error) {
    if (error instanceof Error && error.message !== '[object Object]') {
      throw error;
    }
    throw new Error(fallbackMessage);
  }
}

export async function adminLogin(credentials: { email: string; password: string }) {
  const response = await fetch(buildAdminApiUrl('/api/admin/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  return handleJson<{ token: string; admin: { email: string; full_name?: string } }>(
    response,
    'Failed to sign in'
  );
}

export async function adminRegister(
  payload: AdminCredentials,
  registrationKey?: string
): Promise<{ token: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (registrationKey) {
    headers['x-registration-key'] = registrationKey;
  }

  const response = await fetch(buildAdminApiUrl('/api/admin/register'), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  return handleJson<{ token: string }>(response, 'Failed to register admin');
}

export async function listUsers(adminToken: string): Promise<AdminUser[]> {
  const response = await fetch(buildAdminApiUrl('/api/users'), {
    headers: {
      Authorization: `Bearer ${adminToken}`
    }
  });
  const data = await handleJson<{ users: AdminUser[] }>(response, 'Failed to fetch users');
  return data.users;
}

export async function listAdmins(adminToken: string): Promise<AdminUser[]> {
  const response = await fetch(buildAdminApiUrl('/api/admins'), {
    headers: {
      Authorization: `Bearer ${adminToken}`
    }
  });
  const data = await handleJson<{ admins: AdminUser[] }>(response, 'Failed to fetch admins');
  return data.admins;
}

export async function updateAdmin(
  adminToken: string,
  adminId: number,
  payload: UpdateUserPayload
) {
  const response = await fetch(buildAdminApiUrl(`/api/admins/${adminId}`), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  return handleJson<{ admin: AdminUser }>(response, 'Failed to update admin');
}

export async function deleteAdmin(adminToken: string, adminId: number) {
  const response = await fetch(buildAdminApiUrl(`/api/admins/${adminId}`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${adminToken}`
    }
  });
  return handleJson<{ success: boolean }>(response, 'Failed to delete admin');
}

export async function resetAdminPassword(adminToken: string, adminId: number, password?: string) {
  const response = await fetch(buildAdminApiUrl(`/api/admins/${adminId}/reset-password`), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(password ? { password } : undefined)
  });
  return handleJson<{
    admin: AdminUser;
    credentials: { email: string; password: string; temporary: boolean };
  }>(response, 'Failed to reset admin password');
}

export async function createUser(adminToken: string, payload: CreateUserPayload) {
  const response = await fetch(buildAdminApiUrl('/api/users'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  return handleJson<{
    user: AdminUser;
    credentials: { email: string; password: string; temporary: boolean };
  }>(response, 'Failed to create user');
}

export async function updateUser(
  adminToken: string,
  userId: number,
  payload: UpdateUserPayload
) {
  const response = await fetch(buildAdminApiUrl(`/api/users/${userId}`), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  return handleJson<{ user: AdminUser }>(response, 'Failed to update user');
}

export async function deleteUser(adminToken: string, userId: number) {
  const response = await fetch(buildAdminApiUrl(`/api/users/${userId}`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${adminToken}`
    }
  });
  return handleJson<{ success: boolean }>(response, 'Failed to delete user');
}

export async function resetUserPassword(adminToken: string, userId: number, password?: string) {
  const response = await fetch(buildAdminApiUrl(`/api/users/${userId}/reset-password`), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(password ? { password } : undefined)
  });
  return handleJson<{
    user: AdminUser;
    credentials: { email: string; password: string; temporary: boolean };
  }>(response, 'Failed to reset password');
}

export const buildUserApiUrlFromFrontend = buildUserApiUrl;
