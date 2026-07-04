import { createContext, useState, useEffect } from 'react';
import * as api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('hrms_user');
    if (stored) setUser(JSON.parse(stored));
    setReady(true);
  }, []);

  const persistUser = (u) => {
    setUser(u);
    localStorage.setItem('hrms_user', JSON.stringify(u));
  };

  const signIn = async (identifier, password) => {
    const { data } = await api.login(identifier, password);
    localStorage.setItem('hrms_token', data.token);
    persistUser(data.user);
    return data.user;
  };

  const signOut = () => {
    localStorage.removeItem('hrms_token');
    localStorage.removeItem('hrms_user');
    setUser(null);
  };

  const clearForcePasswordFlag = () => {
    if (!user) return;
    const updated = { ...user, forcePasswordChange: false };
    persistUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, ready, signIn, signOut, clearForcePasswordFlag }}>
      {children}
    </AuthContext.Provider>
  );
}
