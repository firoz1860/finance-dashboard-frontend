import { createContext, useEffect, useMemo, useState } from 'react';
import { loginRequest, logoutRequest, meRequest } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('finance-token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setCurrentUser(await meRequest());
      } catch {
        setToken(null);
        localStorage.removeItem('finance-token');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const signIn = async (creds) => {
    const session = await loginRequest(creds);
    setToken(session.token);
    setCurrentUser(session.user);
    localStorage.setItem('finance-token', session.token);
  };

  const signOut = async () => {
    try {
      await logoutRequest();
    } catch {
      // Logout endpoint is best-effort; local cleanup must always happen.
    } finally {
      setToken(null);
      setCurrentUser(null);
      localStorage.removeItem('finance-token');
    }
  };

  const value = useMemo(() => ({ token, currentUser, loading, signIn, signOut }), [token, currentUser, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
