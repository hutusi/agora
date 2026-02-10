import type { MappingStrategy } from "./types/agora";

/**
 * Resolve the search term from the current page based on the mapping strategy.
 * Returns the term string to search for in GitHub Discussions.
 */
export function resolveTerm(strategy: MappingStrategy): string {
  if (typeof window === "undefined") return "";

  switch (strategy) {
    case "pathname": {
      let path = window.location.pathname;
      // Strip trailing extension (e.g., .html)
      path = path.replace(/\.\w+$/, "");
      // Strip trailing slash
      path = path.replace(/\/$/, "");
      return path || "/";
    }
    case "url": {
      const url = new URL(window.location.href);
      url.hash = "";
      // Remove common tracking params
      url.searchParams.delete("utm_source");
      url.searchParams.delete("utm_medium");
      url.searchParams.delete("utm_campaign");
      return url.href;
    }
    case "title":
      return document.title;
    case "og:title": {
      const meta = document.querySelector<HTMLMetaElement>(
        'meta[property="og:title"]'
      );
      return meta?.content || document.title;
    }
    default:
      return "";
  }
}

/**
 * Build the GitHub search query string for finding a discussion.
 */
export function buildSearchQuery(
  repo: string,
  category: string,
  term: string,
  strict: boolean
): string {
  if (strict) {
    const hash = sha1Sync(term);
    return `repo:${repo} category:"${category}" in:body "${hash}"`;
  }
  return `repo:${repo} category:"${category}" in:title "${term}"`;
}

/**
 * Simple synchronous SHA-1 hash using Web Crypto.
 * Falls back to a placeholder on SSR.
 */
async function sha1(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Simple non-crypto hash for synchronous use.
 * Used as a deterministic identifier, not for security.
 */
function sha1Sync(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const chr = input.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return Math.abs(hash).toString(16);
}

/** Async SHA-1 for creating discussion bodies in strict mode */
export { sha1 };
