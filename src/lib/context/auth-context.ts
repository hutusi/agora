"use client";

import { createContext, useContext } from "react";
import type { IUser } from "../types/adapter";

export interface AuthState {
  token: string | null;
  viewer: IUser | null;
  isAuthenticated: boolean;
  loginUrl: string;
  signOut: () => void;
}

export const AuthContext = createContext<AuthState>({
  token: null,
  viewer: null,
  isAuthenticated: false,
  loginUrl: "",
  signOut: () => {},
});

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
