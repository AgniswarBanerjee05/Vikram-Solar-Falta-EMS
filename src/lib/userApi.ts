import userClient from '../api/userClient';

export interface UserProfile {
  id: number;
  email: string;
  full_name: string | null;
  status: 'ACTIVE' | 'DISABLED';
  created_at: string;
  updated_at: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Change the current user's password
 */
export async function changePassword(
  token: string,
  payload: ChangePasswordRequest
): Promise<{ user: UserProfile }> {
  const response = await userClient.put<{ user: UserProfile }>(
    '/api/me/password',
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
}

/**
 * Get current user profile
 */
export async function getUserProfile(token: string): Promise<{ user: UserProfile }> {
  const response = await userClient.get<{ user: UserProfile }>('/api/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}
