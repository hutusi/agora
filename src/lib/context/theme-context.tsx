"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import type { AgoraTheme } from "../types/agora";

interface ThemeContextValue {
  theme: AgoraTheme;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: "system" });

export function ThemeProvider({
  theme,
  children,
}: {
  theme: AgoraTheme;
  children: ReactNode;
}) {
  useEffect(() => {
    // If theme is a URL, dynamically load the custom CSS
    if (theme.startsWith("http://") || theme.startsWith("https://")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = theme;
      link.id = "agora-custom-theme";
      document.head.appendChild(link);
      return () => {
        link.remove();
      };
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
