import type { DiscussionProvider } from "../types/provider";
import { GitHubDiscussionsProvider } from "./github-discussions";

export type ProviderType = "github-discussions";

export function createProvider(
  type: ProviderType,
  getToken: () => string | null,
  host: string
): DiscussionProvider {
  switch (type) {
    case "github-discussions":
      return new GitHubDiscussionsProvider(getToken, host);
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}
