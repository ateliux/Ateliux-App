"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isApiError } from "@/lib/api/client";
import {
  getClientSession,
  loginClient,
  logoutClient,
  registerClient,
  type ClientAccount,
  type ClientLoginInput,
  type ClientRegisterInput,
} from "@/services/client-auth.service";

export type AuthUser = {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  clientId?: string;
};

type LoginMockInput = {
  name?: string;
  email: string;
  avatarUrl?: string;
};

type AuthState = {
  user: AuthUser | null;
  client: ClientAccount | null;
  isAuthenticated: boolean;
  loading: boolean;
  devFallback: boolean;
  login: (input: ClientLoginInput) => Promise<void>;
  register: (input: ClientRegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  loginMock: (input: LoginMockInput) => void;
  logoutMock: () => Promise<void>;
};

const MockAuthContext = createContext<AuthState | null>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [client, setClient] = useState<ClientAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [devFallback, setDevFallback] = useState(false);

  const applySession = useCallback((session: Awaited<ReturnType<typeof getClientSession>>) => {
    setUser({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      clientId: session.user.clientId,
    });
    setClient(session.client ?? null);
    setDevFallback(false);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const session = await getClientSession();
      applySession(session);
    } catch (error) {
      setUser(null);
      setClient(null);
      if (!isApiError(error) || error.status !== 401) {
        setDevFallback(process.env.NODE_ENV !== "production");
      }
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshSession();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshSession]);

  const login = useCallback(
    async (input: ClientLoginInput) => {
      const session = await loginClient(input);
      applySession(session);
    },
    [applySession],
  );

  const register = useCallback(
    async (input: ClientRegisterInput) => {
      const session = await registerClient(input);
      applySession(session);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await logoutClient();
    } catch (error) {
      if (!isApiError(error) || error.status !== 401) {
        throw error;
      }
    } finally {
      setUser(null);
      setClient(null);
      setDevFallback(false);
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      client,
      isAuthenticated: Boolean(user),
      loading,
      devFallback,
      login,
      register,
      logout,
      refreshSession,
      loginMock(input) {
        if (process.env.NODE_ENV === "production") {
          throw new Error("devFallback nao esta disponivel em producao.");
        }
        const fallbackName = input.email.split("@")[0] || "Cliente Ateliux";

        setUser({
          name: input.name?.trim() || fallbackName,
          email: input.email,
          avatarUrl: input.avatarUrl,
        });
        setClient(null);
        setDevFallback(true);
      },
      logoutMock() {
        return logout();
      },
    }),
    [client, devFallback, loading, login, logout, refreshSession, register, user],
  );

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(MockAuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de MockAuthProvider.");
  }

  return context;
}
