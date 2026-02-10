import type { ReactionContent, IReactionGroups } from "./types/adapter";

export interface ReactionInfo {
  content: ReactionContent;
  emoji: string;
  label: string;
}

export const REACTIONS: ReactionInfo[] = [
  { content: "THUMBS_UP", emoji: "\uD83D\uDC4D", label: "Thumbs up" },
  { content: "THUMBS_DOWN", emoji: "\uD83D\uDC4E", label: "Thumbs down" },
  { content: "LAUGH", emoji: "\uD83D\uDE04", label: "Laugh" },
  { content: "HOORAY", emoji: "\uD83C\uDF89", label: "Hooray" },
  { content: "CONFUSED", emoji: "\uD83D\uDE15", label: "Confused" },
  { content: "HEART", emoji: "\u2764\uFE0F", label: "Heart" },
  { content: "ROCKET", emoji: "\uD83D\uDE80", label: "Rocket" },
  { content: "EYES", emoji: "\uD83D\uDC40", label: "Eyes" },
];

/** Get total reaction count from reaction groups */
export function getTotalReactions(groups: IReactionGroups): number {
  return groups.reduce((sum, g) => sum + g.count, 0);
}

/**
 * Optimistically toggle a reaction in a reaction groups array.
 * Returns a new array (immutable).
 */
export function toggleReactionInGroups(
  groups: IReactionGroups,
  reaction: ReactionContent
): IReactionGroups {
  return groups.map((g) => {
    if (g.content !== reaction) return g;
    const reacted = !g.viewerHasReacted;
    return {
      ...g,
      count: reacted ? g.count + 1 : g.count - 1,
      viewerHasReacted: reacted,
    };
  });
}
