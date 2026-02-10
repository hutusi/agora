/** How to map the current page to a GitHub Discussion */
export type MappingStrategy =
  | "pathname"
  | "url"
  | "title"
  | "og:title"
  | "specific"
  | "number";

export type InputPosition = "top" | "bottom";
export type CommentOrder = "oldest" | "newest";
export type AgoraTheme = "light" | "dark" | "system" | (string & {});

export interface AgoraProps {
  /** GitHub repository in "owner/name" format */
  repo: string;
  /** Repository node ID (from GitHub GraphQL API) */
  repoId: string;
  /** Discussion category name */
  category: string;
  /** Discussion category node ID */
  categoryId: string;

  /**
   * How to map the page to a discussion.
   * @default "pathname"
   */
  mapping?: MappingStrategy;
  /**
   * When mapping="specific", the exact search term.
   * When mapping="number", the discussion number.
   */
  term?: string;
  /**
   * Use strict matching (SHA-1 hash in discussion body).
   * @default false
   */
  strict?: boolean;

  /**
   * Base URL of the Agora backend instance for OAuth and API proxy.
   * @default "https://agora.example.com"
   */
  host?: string;

  /**
   * Theme name or custom CSS URL.
   * @default "system"
   */
  theme?: AgoraTheme;
  /**
   * Where to render the comment input box.
   * @default "bottom"
   */
  inputPosition?: InputPosition;
  /**
   * Default comment sort order.
   * @default "oldest"
   */
  defaultCommentOrder?: CommentOrder;
  /**
   * Enable reactions on the discussion.
   * @default true
   */
  reactionsEnabled?: boolean;
  /**
   * Lazy load: only render when scrolled into view.
   * @default false
   */
  lazy?: boolean;

  /** Called when discussion metadata is loaded */
  onMetadata?: (metadata: DiscussionMetadata) => void;
  /** Called on errors */
  onError?: (error: Error) => void;
}

export interface DiscussionMetadata {
  id: string;
  url: string;
  locked: boolean;
  reactionCount: number;
  totalCommentCount: number;
  totalReplyCount: number;
}
