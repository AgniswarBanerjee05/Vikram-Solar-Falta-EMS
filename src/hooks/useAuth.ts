import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildUserApiUrl, STORAGE_KEYS } from '../lib/config';

export interface AuthUser {
  id: number;
  email: string;
  full_name?: string | null;
  status: 'ACTIVE' | 'DISABLED';
  created_at?: string;
  updated_at?: string;
}

type AuthPhase = 'checking' | 'guest' | 'submitting' | 'authenticated';

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthState {
  phase: AuthPhase;
  token: string | null;
  user: AuthUser | null;
  error: string | null;
}

const initialState: AuthState = {
  phase: 'checking',
  token: null,
  user: null,
  error: null
};

const TOKEN_STORAGE_KEY = STORAGE_KEYS.authToken;

export function useAuth() {
  const [state, setState] = useState<AuthState>(initialState);

  const applyAuth = useCallback((token: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    setState({
      phase: 'authenticated',
      token,
      user,
      error: null
    });
  }, []);

  const resetAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setState({
      phase: 'guest',
      token: null,
      user: null,
      error: null
    });
  }, []);

  const fetchProfile = useCallback(
    async (token: string) => {
      try {
        const response = await fetch(buildUserApiUrl('/api/me'), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to validate session');
        }
        const data = (await response.json()) as { user: AuthUser };
        applyAuth(token, data.user);
      } catch (error) {
        console.error('Failed to validate stored session', error);
        resetAuth();
      }
    },
    [applyAuth, resetAuth]
  );

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setState((current) => ({
        ...current,
        phase: 'guest'
      }));
      return;
    }
    fetchProfile(storedToken);
  }, [fetchProfile]);

  const login = useCallback(
    async ({ email, password }: LoginPayload) => {
      setState((current) => ({
        ...current,
        phase: 'submitting',
        error: null
      }));
      try {
        const response = await fetch(buildUserApiUrl('/api/login'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
          const message =
            response.status === 401
              ? 'Invalid email or password.'
              : 'Unable to sign in. Please try again.';
          setState({
            phase: 'guest',
            token: null,
            user: null,
            error: message
          });
          return false;
        }
        const data = (await response.json()) as { token: string; user: AuthUser };
        applyAuth(data.token, data.user);
        return true;
      } catch (error) {
        console.error('Failed to login', error);
        setState({
          phase: 'guest',
          token: null,
          user: null,
          error: 'Unexpected error while signing in.'
        });
        return false;
      }
    },
    [applyAuth]
  );

  const logout = useCallback(() => {
    resetAuth();
  }, [resetAuth]);

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: state.phase === 'authenticated' && state.token != null,
      isLoading: state.phase === 'checking' || state.phase === 'submitting',
      login,
      logout
    }),
    [login, logout, state]
  );

  return value;
}
