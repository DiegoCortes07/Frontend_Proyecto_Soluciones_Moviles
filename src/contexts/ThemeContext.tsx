import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";

export interface Theme {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundCard: string;
  backgroundElevated: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Borders
  border: string;
  borderLight: string;
  
  // Accent colors
  primary: string;
  primaryDark: string;
  primaryLight: string;
  
  // Status colors
  success: string;
  error: string;
  warning: string;
  
  // Special
  overlay: string;
  shadow: string;
  liked: string;
}

const darkTheme: Theme = {
  // Backgrounds - Oscuros y profundos
  background: "#0a0e1a",
  backgroundSecondary: "#0f1d38",
  backgroundCard: "#152442",
  backgroundElevated: "#1a2f57",
  
  // Text - Claros con jerarquía
  textPrimary: "#f4f8ff",
  textSecondary: "#dfe8ff",
  textTertiary: "#8ba3c7",
  
  // Borders - Sutiles
  border: "#1c2f55",
  borderLight: "#2a3f6b",
  
  // Accent - Cyan brillante
  primary: "#1DB9FF",
  primaryDark: "#0a95d9",
  primaryLight: "#9fd6ff",
  
  // Status
  success: "#1DB954",
  error: "#ff6b6b",
  warning: "#ffa726",
  
  // Special
  overlay: "rgba(5, 13, 26, 0.95)",
  shadow: "#000000",
  liked: "#ff6b81",
};

const lightTheme: Theme = {
  // Backgrounds - Azul muy claro y elegante
  background: "#f0f4f8",
  backgroundSecondary: "#ffffff",
  backgroundCard: "#e3f2fd",
  backgroundElevated: "#bbdefb",
  
  // Text - Oscuros con buen contraste
  textPrimary: "#1a237e",
  textSecondary: "#283593",
  textTertiary: "#5c6bc0",
  
  // Borders - Azul claro suave
  border: "#90caf9",
  borderLight: "#bbdefb",
  
  // Accent - Azul vibrante pero suave
  primary: "#2196f3",
  primaryDark: "#1976d2",
  primaryLight: "#64b5f6",
  
  // Status
  success: "#4caf50",
  error: "#f44336",
  warning: "#ff9800",
  
  // Special
  overlay: "rgba(240, 244, 248, 0.95)",
  shadow: "#00000020",
  liked: "#e91e63",
};

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  
  const value = useMemo(() => {
    const raw = auth.user?.theme as any;
    const isBoolean = typeof raw === "boolean";
    const isDark = isBoolean ? !raw : (raw === "dark");
    const resolved = isDark ? darkTheme : lightTheme;
    
    return {
      theme: resolved,
      isDark,
    };
  }, [auth.user?.theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export default ThemeContext;
