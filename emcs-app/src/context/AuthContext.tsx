import { createContext, useContext, useState } from 'react';
import { mockApi } from '../services/api';
import type { ReactNode } from 'react';

export type UserRole = 'User' | 'Supervisor' | 'Manager' | 'Dept Head' | 'Admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('emcs_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string) => {
    try {
      const loggedInUser = await mockApi.login(email);
      if (loggedInUser) {
        setUser(loggedInUser as any);
        localStorage.setItem('emcs_user', JSON.stringify(loggedInUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('emcs_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
