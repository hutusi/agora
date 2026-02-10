import type {
  GComment,
  GDiscussion,
  GReactionGroup,
  GReply,
  GUser,
} from "./types/github";
import type {
  IComment,
  IDiscussion,
  IReactionGroups,
  IReply,
  IUser,
  AuthorAssociation,
  ReactionContent,
} from "./types/adapter";

const DELETED_USER: IUser = {
  avatarUrl: "",
  login: "[deleted]",
  url: "",
};

export function adaptUser(user: GUser | null): IUser {
  if (!user) return DELETED_USER;
  return {
    avatarUrl: user.avatarUrl,
    login: user.login,
    url: user.url,
  };
}

export function adaptReactionGroups(
  groups: GReactionGroup[]
): IReactionGroups {
  return groups.map((g) => ({
    content: g.content as ReactionContent,
    count: g.users.totalCount,
    viewerHasReacted: g.viewerHasReacted,
  }));
}

export function adaptReply(reply: GReply): IReply {
  return {
    id: reply.id,
    author: adaptUser(reply.author),
    viewerDidAuthor: reply.viewerDidAuthor,
    createdAt: reply.createdAt,
    url: reply.url,
    authorAssociation: reply.authorAssociation as AuthorAssociation,
    lastEditedAt: reply.lastEditedAt,
    deletedAt: reply.deletedAt,
    isMinimized: reply.isMinimized,
    bodyHTML: reply.bodyHTML,
    reactionGroups: adaptReactionGroups(reply.reactionGroups),
    replyToId: reply.replyTo?.id ?? null,
  };
}

export function adaptComment(comment: GComment): IComment {
  return {
    id: comment.id,
    author: adaptUser(comment.author),
    viewerDidAuthor: comment.viewerDidAuthor,
    createdAt: comment.createdAt,
    url: comment.url,
    authorAssociation: comment.authorAssociation as AuthorAssociation,
    lastEditedAt: comment.lastEditedAt,
    deletedAt: comment.deletedAt,
    isMinimized: comment.isMinimized,
    bodyHTML: comment.bodyHTML,
    upvoteCount: comment.upvoteCount,
    viewerHasUpvoted: comment.viewerHasUpvoted,
    viewerCanUpvote: comment.viewerCanUpvote,
    reactionGroups: adaptReactionGroups(comment.reactionGroups),
    replies: comment.replies.nodes.map(adaptReply),
    replyCount: comment.replies.totalCount,
  };
}

export function adaptDiscussion(discussion: GDiscussion): IDiscussion {
  const totalReplyCount = discussion.comments.nodes.reduce(
    (sum, c) => sum + c.replies.totalCount,
    0
  );

  return {
    id: discussion.id,
    url: discussion.url,
    locked: discussion.locked,
    repoNameWithOwner: discussion.repository.nameWithOwner,
    reactionGroups: adaptReactionGroups(discussion.reactionGroups),
    totalCommentCount: discussion.comments.totalCount,
    totalReplyCount,
    comments: discussion.comments.nodes.map(adaptComment),
    pageInfo: {
      startCursor: discussion.comments.pageInfo.startCursor,
      endCursor: discussion.comments.pageInfo.endCursor,
      hasNextPage: discussion.comments.pageInfo.hasNextPage,
      hasPreviousPage: discussion.comments.pageInfo.hasPreviousPage,
    },
  };
}
