"use client";

import { useMemo } from "react";
import { SWRConfig } from "swr";
import type { AgoraProps } from "@/lib/types/agora";
import { AuthContext } from "@/lib/context/auth-context";
import { ConfigContext } from "@/lib/context/config-context";
import { ThemeProvider } from "@/lib/context/theme-context";
import { useAuthInit } from "@/lib/hooks/use-auth";
import { createProvider } from "@/lib/providers";
import { resolveTerm } from "@/lib/mapping";
import { CommentSection } from "./comment-section";
import { ErrorBoundary } from "./error-boundary";
import { Loading } from "./loading";

const DEFAULT_HOST =
  typeof window !== "undefined" ? window.location.origin : "";

export function Agora(props: AgoraProps) {
  const {
    repo,
    repoId,
    category,
    categoryId,
    mapping = "pathname",
    term: termProp,
    strict = false,
    host = DEFAULT_HOST,
    theme = "system",
    inputPosition = "bottom",
    defaultCommentOrder = "oldest",
    reactionsEnabled = true,
    lazy = false,
    onMetadata,
    onError,
  } = props;

  const { isInitialized, ...authState } = useAuthInit(host);

  // Resolve the mapping term from the page
  const resolvedTerm = useMemo(() => {
    if (mapping === "number") return undefined;
    return termProp || resolveTerm(mapping);
  }, [mapping, termProp]);

  const resolvedNumber =
    mapping === "number" && termProp ? Number(termProp) : undefined;

  // Create the provider
  const provider = useMemo(
    () => createProvider("github-discussions", () => authState.token, host),
    [authState.token, host]
  );

  const themeValue = theme.startsWith("http") ? "system" : theme;

  if (!isInitialized) {
    return (
      <div className="agora" data-theme={themeValue}>
        <Loading />
      </div>
    );
  }

  return (
    <ErrorBoundary onError={onError}>
      <SWRConfig value={{ provider: () => new Map() }}>
        <ConfigContext.Provider value={props}>
          <AuthContext.Provider value={authState}>
            <ThemeProvider theme={theme}>
              <div className="agora" data-theme={themeValue}>
                <CommentSection
                  provider={provider}
                  repo={repo}
                  repoId={repoId}
                  categoryId={categoryId}
                  term={resolvedTerm}
                  number={resolvedNumber}
                  category={category}
                  strict={strict}
                  reactionsEnabled={reactionsEnabled}
                  inputPosition={inputPosition}
                  defaultCommentOrder={defaultCommentOrder}
                  onMetadata={onMetadata}
                />
              </div>
            </ThemeProvider>
          </AuthContext.Provider>
        </ConfigContext.Provider>
      </SWRConfig>
    </ErrorBoundary>
  );
}
