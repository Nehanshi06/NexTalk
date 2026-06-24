import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nt_user')); } catch { return null; }
  });

  const login = (u) => { setUser(u); localStorage.setItem('nt_user', JSON.stringify(u)); };
  const logout = () => { setUser(null); localStorage.removeItem('nt_user'); };
  const updateUser = (u) => { const n = { ...user, ...u }; setUser(n); localStorage.setItem('nt_user', JSON.stringify(n)); };

  return <AuthContext.Provider value={{ user, login, logout, updateUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
