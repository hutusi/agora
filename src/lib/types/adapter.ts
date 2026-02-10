/** Normalized user representation */
export interface IUser {
  avatarUrl: string;
  login: string;
  url: string;
}

/** GitHub author association */
export type AuthorAssociation =
  | "COLLABORATOR"
  | "CONTRIBUTOR"
  | "FIRST_TIMER"
  | "FIRST_TIME_CONTRIBUTOR"
  | "MANNEQUIN"
  | "MEMBER"
  | "NONE"
  | "OWNER";

/** Reaction content types matching GitHub's 8 reactions */
export type ReactionContent =
  | "THUMBS_UP"
  | "THUMBS_DOWN"
  | "LAUGH"
  | "HOORAY"
  | "CONFUSED"
  | "HEART"
  | "ROCKET"
  | "EYES";

export interface IReactionGroup {
  content: ReactionContent;
  count: number;
  viewerHasReacted: boolean;
}

export type IReactionGroups = IReactionGroup[];

/** Normalized reply */
export interface IReply {
  id: string;
  author: IUser;
  viewerDidAuthor: boolean;
  createdAt: string;
  url: string;
  authorAssociation: AuthorAssociation;
  lastEditedAt: string | null;
  deletedAt: string | null;
  isMinimized: boolean;
  bodyHTML: string;
  reactionGroups: IReactionGroups;
  replyToId: string | null;
}

/** Normalized comment (top-level) */
export interface IComment {
  id: string;
  author: IUser;
  viewerDidAuthor: boolean;
  createdAt: string;
  url: string;
  authorAssociation: AuthorAssociation;
  lastEditedAt: string | null;
  deletedAt: string | null;
  isMinimized: boolean;
  bodyHTML: string;
  upvoteCount: number;
  viewerHasUpvoted: boolean;
  viewerCanUpvote: boolean;
  reactionGroups: IReactionGroups;
  replies: IReply[];
  replyCount: number;
}

export interface IPageInfo {
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Normalized discussion */
export interface IDiscussion {
  id: string;
  url: string;
  locked: boolean;
  repoNameWithOwner: string;
  reactionGroups: IReactionGroups;
  totalCommentCount: number;
  totalReplyCount: number;
  comments: IComment[];
  pageInfo: IPageInfo;
}
