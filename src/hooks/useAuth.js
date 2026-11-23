// LexAI v6 — useAuth.js
import { createContext, useContext, useState, useCallback } from 'react';
import { DEMO_USERS } from '../utils/constants';

const runtimeUsers = { ...DEMO_USERS };
const AuthContext   = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback((email, password) => {
    const found = runtimeUsers[email.toLowerCase()];
    if (!found || found.password !== password) return 'Invalid email or password. Try user@demo.com / demo123';
    setUser({ email: email.toLowerCase(), ...found });
    return null;
  }, []);

  const signup = useCallback((name, email, password, role) => {
    if (!name||!email||!password) return 'All fields required.';
    const key = email.toLowerCase();
    if (runtimeUsers[key]) return 'Email already registered.';
    const avatar = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    runtimeUsers[key] = {password,role,name,avatar,cases:0};
    setUser({email:key,...runtimeUsers[key]});
    return null;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return <AuthContext.Provider value={{user,login,signup,logout}}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
