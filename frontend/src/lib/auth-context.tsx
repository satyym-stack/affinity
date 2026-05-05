'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import {
  clearStoredToken,
  getCurrentUser,
  getStoredToken,
  login as loginRequest,
  setStoredToken,
  signup as signupRequest
} from '@/lib/api/auth';
import type { AuthUser, LoginPayload, SignupPayload } from '@/types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStoredSession() {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(storedToken);

        if (!cancelled) {
          setToken(storedToken);
          setUser(currentUser);
        }
      } catch {
        clearStoredToken();

        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadStoredSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin(payload: LoginPayload) {
    const tokenResponse = await loginRequest(payload);
    setStoredToken(tokenResponse.access_token);

    const currentUser = await getCurrentUser(tokenResponse.access_token);
    setToken(tokenResponse.access_token);
    setUser(currentUser);
  }

  async function handleSignup(payload: SignupPayload) {
    const tokenResponse = await signupRequest(payload);
    setStoredToken(tokenResponse.access_token);

    const currentUser = await getCurrentUser(tokenResponse.access_token);
    setToken(tokenResponse.access_token);
    setUser(currentUser);
  }

  function handleLogout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login: handleLogin,
      signup: handleSignup,
      logout: handleLogout
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
