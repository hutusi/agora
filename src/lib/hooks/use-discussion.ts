"use client";

import useSWR from "swr";
import type { DiscussionProvider, GetDiscussionParams } from "../types/provider";
import type { IComment, IDiscussion, IUser, ReactionContent } from "../types/adapter";
import type { CommentOrder } from "../types/agora";
import { toggleReactionInGroups } from "../reactions";

interface UseDiscussionOptions {
  provider: DiscussionProvider;
  params: GetDiscussionParams;
  commentOrder: CommentOrder;
}

interface UseDiscussionReturn {
  viewer: IUser | null;
  discussion: IDiscussion | null;
  comments: IComment[];
  error: Error | undefined;
  isLoading: boolean;
  isNotFound: boolean;
  hasMore: boolean;
  numHidden: number;
  addNewComment: (comment: IComment) => void;
  addNewReply: (commentId: string, reply: import("../types/adapter").IReply) => void;
  toggleDiscussionReaction: (reaction: ReactionContent) => Promise<void>;
  toggleCommentReaction: (commentId: string, reaction: ReactionContent) => Promise<void>;
  toggleReplyReaction: (commentId: string, replyId: string, reaction: ReactionContent) => Promise<void>;
  mutate: () => void;
}

const PAGE_SIZE = 20;

export function useDiscussion({
  provider,
  params,
  commentOrder,
}: UseDiscussionOptions): UseDiscussionReturn {
  const hasKey = !!(params.term || params.number);

  const { data, error, isLoading, mutate } = useSWR(
    hasKey ? ["agora-discussion", params.repo, params.term, params.number, commentOrder] : null,
    () =>
      provider.getDiscussion({
        ...params,
        first: commentOrder === "oldest" ? PAGE_SIZE : undefined,
        last: commentOrder === "newest" ? PAGE_SIZE : undefined,
      }),
    { revalidateOnFocus: false }
  );

  const viewer = data?.viewer ?? null;
  const discussion = data?.discussion ?? null;
  const comments = discussion?.comments ?? [];

  const addNewComment = (comment: IComment) => {
    mutate(
      (prev) => {
        if (!prev?.discussion) return prev;
        return {
          ...prev,
          discussion: {
            ...prev.discussion,
            totalCommentCount: prev.discussion.totalCommentCount + 1,
            comments: [...prev.discussion.comments, comment],
          },
        };
      },
      { revalidate: false }
    );
  };

  const addNewReply = (commentId: string, reply: import("../types/adapter").IReply) => {
    mutate(
      (prev) => {
        if (!prev?.discussion) return prev;
        return {
          ...prev,
          discussion: {
            ...prev.discussion,
            totalReplyCount: prev.discussion.totalReplyCount + 1,
            comments: prev.discussion.comments.map((c) =>
              c.id === commentId
                ? { ...c, replies: [...c.replies, reply], replyCount: c.replyCount + 1 }
                : c
            ),
          },
        };
      },
      { revalidate: false }
    );
  };

  const toggleDiscussionReaction = async (reaction: ReactionContent) => {
    if (!discussion) return;
    const group = discussion.reactionGroups.find((g) => g.content === reaction);
    if (!group) return;

    // Optimistic update
    mutate(
      (prev) => {
        if (!prev?.discussion) return prev;
        return {
          ...prev,
          discussion: {
            ...prev.discussion,
            reactionGroups: toggleReactionInGroups(prev.discussion.reactionGroups, reaction),
          },
        };
      },
      { revalidate: false }
    );

    await provider.toggleReaction({
      subjectId: discussion.id,
      reaction,
      viewerHasReacted: group.viewerHasReacted,
    });
  };

  const toggleCommentReaction = async (commentId: string, reaction: ReactionContent) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;
    const group = comment.reactionGroups.find((g) => g.content === reaction);
    if (!group) return;

    mutate(
      (prev) => {
        if (!prev?.discussion) return prev;
        return {
          ...prev,
          discussion: {
            ...prev.discussion,
            comments: prev.discussion.comments.map((c) =>
              c.id === commentId
                ? { ...c, reactionGroups: toggleReactionInGroups(c.reactionGroups, reaction) }
                : c
            ),
          },
        };
      },
      { revalidate: false }
    );

    await provider.toggleReaction({
      subjectId: commentId,
      reaction,
      viewerHasReacted: group.viewerHasReacted,
    });
  };

  const toggleReplyReaction = async (
    commentId: string,
    replyId: string,
    reaction: ReactionContent
  ) => {
    const comment = comments.find((c) => c.id === commentId);
    const reply = comment?.replies.find((r) => r.id === replyId);
    if (!reply) return;
    const group = reply.reactionGroups.find((g) => g.content === reaction);
    if (!group) return;

    mutate(
      (prev) => {
        if (!prev?.discussion) return prev;
        return {
          ...prev,
          discussion: {
            ...prev.discussion,
            comments: prev.discussion.comments.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    replies: c.replies.map((r) =>
                      r.id === replyId
                        ? { ...r, reactionGroups: toggleReactionInGroups(r.reactionGroups, reaction) }
                        : r
                    ),
                  }
                : c
            ),
          },
        };
      },
      { revalidate: false }
    );

    await provider.toggleReaction({
      subjectId: replyId,
      reaction,
      viewerHasReacted: group.viewerHasReacted,
    });
  };

  return {
    viewer,
    discussion,
    comments,
    error,
    isLoading,
    isNotFound: !isLoading && !error && !discussion,
    hasMore: discussion?.pageInfo?.hasNextPage ?? false,
    numHidden: (discussion?.totalCommentCount ?? 0) - comments.length,
    addNewComment,
    addNewReply,
    toggleDiscussionReaction,
    toggleCommentReaction,
    toggleReplyReaction,
    mutate: () => mutate(),
  };
}
