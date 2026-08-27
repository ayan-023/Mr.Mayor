/**
 * MR. MAYOR - Authentication & Role Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, DepartmentName } from '../types/index';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  loginWithCredentials: (emailOrCode: string, password?: string) => { success: boolean; message?: string };
  registerAuthority: (userData: Partial<User>) => Promise<User>;
  deleteAuthority: (userId: string) => Promise<void>;
  refreshUsers: () => Promise<User[]>;
  logout: () => void;
  switchUser: (userId: string) => void;
  hasPermission: (permission: string) => boolean;
  isRole: (role: UserRole | UserRole[]) => boolean;
  isDepartment: (dept: DepartmentName | DepartmentName[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await api.getUsers();
        setAllUsers(res.users);
        // By default, start at the "Who is logging in?" persona selection screen
        // to let users select their role and inspect corresponding features
        setCurrentUser(null);
      } catch (err) {
        console.error('Failed to load users from API:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  const refreshUsers = async (): Promise<User[]> => {
    try {
      const res = await api.getUsers();
      setAllUsers(res.users);
      return res.users;
    } catch (err) {
      console.error('Failed to refresh users:', err);
      return [];
    }
  };

  const registerAuthority = async (userData: Partial<User>): Promise<User> => {
    const res = await api.createUser(userData);
    const updatedUsers = await refreshUsers();
    setCurrentUser(res.user);
    localStorage.setItem('mr_mayor_auth_user_id', res.user.id);
    return res.user;
  };

  const deleteAuthority = async (userId: string): Promise<void> => {
    await api.deleteUser(userId);
    const updatedUsers = await refreshUsers();
    if (currentUser?.id === userId) {
      if (updatedUsers.length > 0) {
        setCurrentUser(updatedUsers[0]);
        localStorage.setItem('mr_mayor_auth_user_id', updatedUsers[0].id);
      } else {
        setCurrentUser(null);
        localStorage.removeItem('mr_mayor_auth_user_id');
      }
    }
  };

  const login = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('mr_mayor_auth_user_id', user.id);
    }
  };

  const loginWithCredentials = (emailOrCode: string, _password?: string): { success: boolean; message?: string } => {
    const cleanId = emailOrCode.trim().toLowerCase();
    const user = allUsers.find(
      (u) => u.id.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('mr_mayor_auth_user_id', user.id);
      return { success: true };
    }

    return {
      success: false,
      message: 'Authority not found. Please check official email or employee code.',
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mr_mayor_auth_user_id');
  };

  const switchUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('mr_mayor_auth_user_id', user.id);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'COMMISSIONER' || currentUser.role === 'NODAL_OFFICER' || currentUser.role === 'ADMIN') {
      return true;
    }
    return Array.isArray(currentUser.permissions) ? currentUser.permissions.includes(permission) : false;
  };

  const isRole = (role: UserRole | UserRole[]): boolean => {
    if (!currentUser || !currentUser.role) return false;
    if (Array.isArray(role)) return role.includes(currentUser.role);
    return currentUser.role === role;
  };

  const isDepartment = (dept: DepartmentName | DepartmentName[]): boolean => {
    if (!currentUser || !currentUser.department) return false;
    if (Array.isArray(dept)) return dept.includes(currentUser.department as DepartmentName);
    return currentUser.department === dept;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isLoading,
        isAuthenticated: !!currentUser,
        login,
        loginWithCredentials,
        registerAuthority,
        deleteAuthority,
        refreshUsers,
        logout,
        switchUser,
        hasPermission,
        isRole,
        isDepartment,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
