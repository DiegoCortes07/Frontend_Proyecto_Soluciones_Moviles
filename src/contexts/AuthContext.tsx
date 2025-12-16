import React, { createContext, useContext, useEffect, useState } from "react";
import { me } from "../../api/auth";
import User from "../interfaces/User";
import { useDeleteData } from "../features/home/hooks/appStorage";

type AuthContextValue = {
  token?: string;
  setToken: (t?: string) => void;
  user: User | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const setToken = (t?: string) => {
    setTokenState(t);
  };

  const loadUser = async (t?: string) => {
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const u = await me(t);
      setUser(u);
    } catch (err) {
      console.error("AuthProvider: error loading user", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser(token);
  }, [token]);

  const logout = async () => {
    setTokenState(undefined);
    setUser(null);
    useDeleteData("session");
  };

  const refreshUser = async () => loadUser(token);

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, user, loading, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
