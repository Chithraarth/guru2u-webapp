import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import { auth, getIdToken, watchAuthState } from '@/lib/firebase';
import type { User } from 'firebase/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthTokenGetter(() => getIdToken());
    const unsubscribe = watchAuthState((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => {
      unsubscribe();
      setAuthTokenGetter(null);
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
