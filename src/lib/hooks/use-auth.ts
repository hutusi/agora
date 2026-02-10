"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { getToken, getLoginUrl, signOut as doSignOut } from "../oauth/session";
import type { AuthState } from "../context/auth-context";

/**
 * Initialize and manage authentication state.
 */
export function useAuthInit(host: string): AuthState & { isInitialized: boolean } {
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const t = await getToken(host);
        if (!cancelled) setToken(t);
      } catch {
        // Token exchange failed — user is not authenticated
      } finally {
        if (!cancelled) setIsInitialized(true);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [host]);

  const handleSignOut = useCallback(() => {
    doSignOut();
    setToken(null);
  }, []);

  const loginUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return getLoginUrl(host, window.location.href);
  }, [host]);

  return {
    token,
    viewer: null, // Will be populated by useDiscussion
    isAuthenticated: !!token,
    loginUrl,
    signOut: handleSignOut,
    isInitialized,
  };
}
