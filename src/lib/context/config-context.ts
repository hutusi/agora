"use client";

import { createContext, useContext } from "react";
import type { AgoraProps } from "../types/agora";

export const ConfigContext = createContext<AgoraProps>({} as AgoraProps);

export function useConfig(): AgoraProps {
  return useContext(ConfigContext);
}
