// Main component
export { Agora } from "./components/agora";

// Props types
export type {
  AgoraProps,
  MappingStrategy,
  AgoraTheme,
  InputPosition,
  CommentOrder,
  DiscussionMetadata,
} from "./lib/types/agora";

// Provider types (for advanced users building custom providers)
export type { DiscussionProvider } from "./lib/types/provider";

// Normalized data types (for consumers using onMetadata or building custom UI)
export type {
  IComment,
  IReply,
  IUser,
  IReactionGroups,
  IDiscussion,
  ReactionContent,
} from "./lib/types/adapter";
