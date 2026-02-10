/** Raw GitHub GraphQL API response types */

export interface GUser {
  avatarUrl: string;
  login: string;
  url: string;
}

export interface GReactionGroup {
  content: string;
  users: { totalCount: number };
  viewerHasReacted: boolean;
}

export interface GReply {
  id: string;
  author: GUser | null;
  viewerDidAuthor: boolean;
  createdAt: string;
  url: string;
  authorAssociation: string;
  lastEditedAt: string | null;
  deletedAt: string | null;
  isMinimized: boolean;
  bodyHTML: string;
  reactionGroups: GReactionGroup[];
  replyTo: { id: string } | null;
}

export interface GComment {
  id: string;
  author: GUser | null;
  viewerDidAuthor: boolean;
  createdAt: string;
  url: string;
  authorAssociation: string;
  lastEditedAt: string | null;
  deletedAt: string | null;
  isMinimized: boolean;
  bodyHTML: string;
  upvoteCount: number;
  viewerHasUpvoted: boolean;
  viewerCanUpvote: boolean;
  reactionGroups: GReactionGroup[];
  replies: {
    totalCount: number;
    nodes: GReply[];
  };
}

export interface GPageInfo {
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GDiscussion {
  id: string;
  url: string;
  locked: boolean;
  repository: { nameWithOwner: string };
  reactions: { totalCount: number };
  reactionGroups: GReactionGroup[];
  comments: {
    totalCount: number;
    pageInfo: GPageInfo;
    nodes: GComment[];
  };
}

export interface GSearchResponse {
  data: {
    viewer: GUser;
    search: {
      discussionCount: number;
      nodes: GDiscussion[];
    };
  };
}

export interface GDiscussionByNumberResponse {
  data: {
    viewer: GUser;
    repository: {
      discussion: GDiscussion | null;
    };
  };
}

export interface GCategoriesResponse {
  data: {
    search: {
      nodes: Array<{
        id: string;
        discussionCategories: {
          nodes: Array<{
            id: string;
            name: string;
            emojiHTML: string;
          }>;
        };
      }>;
    };
  };
}

export interface GCreateDiscussionResponse {
  data: {
    createDiscussion: {
      discussion: { id: string };
    };
  };
}

export interface GAddCommentResponse {
  data: {
    addDiscussionComment: {
      comment: GComment;
    };
  };
}

export interface GReactionResponse {
  data: {
    addReaction?: { reaction: { content: string; id: string } };
    removeReaction?: { reaction: { content: string; id: string } };
  };
}
