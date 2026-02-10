const SESSION_KEY = "agora_session";
const TOKEN_KEY = "agora_token";

/**
 * Check for a fresh OAuth session in the URL params, store it,
 * and clean the URL. Falls back to localStorage.
 */
export function getStoredSession(): string | null {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  const sessionFromUrl = urlParams.get("agora_session");

  if (sessionFromUrl) {
    localStorage.setItem(SESSION_KEY, sessionFromUrl);
    // Clean the URL
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("agora_session");
    window.history.replaceState({}, "", cleanUrl.href);
    return sessionFromUrl;
  }

  return localStorage.getItem(SESSION_KEY);
}

/**
 * Exchange the encrypted session for a usable access token.
 * Caches the token in sessionStorage for the current tab.
 */
export async function getToken(host: string): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const cachedToken = sessionStorage.getItem(TOKEN_KEY);
  if (cachedToken) return cachedToken;

  const session = getStoredSession();
  if (!session) return null;

  const response = await fetch(`${host}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session }),
  });

  if (!response.ok) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }

  const { token } = await response.json();
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

/** Build the OAuth login URL */
export function getLoginUrl(host: string, redirectUri: string): string {
  return `${host}/api/oauth/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`;
}

/** Clear all stored auth state */
export function signOut(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
