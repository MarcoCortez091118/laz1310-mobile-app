import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

interface AuthContextValue {
  isAuthenticated: boolean;
  signInDemo: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setAuthenticated] = useState(false);

  const signInDemo = useCallback(() => setAuthenticated(true), []);
  const signOut = useCallback(() => setAuthenticated(false), []);

  const value = useMemo(
    () => ({ isAuthenticated, signInDemo, signOut }),
    [isAuthenticated, signInDemo, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
}
