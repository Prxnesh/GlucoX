"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { login as loginRequest, signup as signupRequest } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "glucox.token";
const USER_KEY = "glucox.user";
const LEGACY_TOKEN_KEY = "diasense.token";
const LEGACY_USER_KEY = "diasense.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedToken =
      window.localStorage.getItem(TOKEN_KEY) ??
      window.localStorage.getItem(LEGACY_TOKEN_KEY);
    const storedUser =
      window.localStorage.getItem(USER_KEY) ??
      window.localStorage.getItem(LEGACY_USER_KEY);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser) as User);
      window.localStorage.setItem(TOKEN_KEY, storedToken);
      window.localStorage.setItem(USER_KEY, storedUser);
      window.localStorage.removeItem(LEGACY_TOKEN_KEY);
      window.localStorage.removeItem(LEGACY_USER_KEY);
    }

    setReady(true);
  }, []);

  const persistSession = (nextToken: string, nextUser: User) => {
    startTransition(() => {
      window.localStorage.setItem(TOKEN_KEY, nextToken);
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setToken(nextToken);
      setUser(nextUser);
    });
  };

  const clearSession = () => {
    startTransition(() => {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    });
  };

  const login = async (email: string, password: string) => {
    const response = await loginRequest({ email, password });
    persistSession(response.access_token, response.user);
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await signupRequest({ name, email, password });
    persistSession(response.access_token, response.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        ready,
        login,
        signup,
        logout: clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
