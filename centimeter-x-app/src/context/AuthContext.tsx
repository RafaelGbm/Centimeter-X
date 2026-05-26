import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '../services/auth.service';
import { setOnAuthFailure } from '../services/api';
import { storage } from '../utils/storage';
import type { User } from '../types/models';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const logout = useCallback(async () => {
    await storage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setOnAuthFailure(() => {
      setUser(null);
    });
  }, []);

  useEffect(() => {
    const MIN_SPLASH_MS = 1800;
    (async () => {
      const minDelay = new Promise((r) => setTimeout(r, MIN_SPLASH_MS));
      try {
        const token = await storage.getAccessToken();
        const cached = await storage.getUser();
        if (token && cached) {
          setUser(cached);
          // Revalida em background; se falhar com 401, o interceptor desloga.
          authService.me().then(setUser).catch(() => undefined);
        }
      } finally {
        await minDelay;
        setInitializing(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login(email, password);
    await storage.saveSession(res.accessToken, res.refreshToken, res.user);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await authService.register(name, email, password);
      await login(email, password);
    },
    [login],
  );

  const value = useMemo(
    () => ({ user, initializing, login, register, logout }),
    [user, initializing, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
