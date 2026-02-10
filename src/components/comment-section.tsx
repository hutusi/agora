"use client";

import { useState, useCallback, useEffect } from "react";
import type { DiscussionProvider } from "@/lib/types/provider";
import type { CommentOrder, InputPosition } from "@/lib/types/agora";
import type { DiscussionMetadata } from "@/lib/types/agora";
import { useDiscussion } from "@/lib/hooks/use-discussion";
import { useAuth } from "@/lib/context/auth-context";
import { ReactionButtons } from "./reaction-buttons";
import { Comment } from "./comment";
import { CommentBox } from "./comment-box";
import { Pagination } from "./pagination";
import { Loading } from "./loading";

interface CommentSectionProps {
  provider: DiscussionProvider;
  repo: string;
  repoId: string;
  categoryId: string;
  term?: string;
  number?: number;
  category: string;
  strict: boolean;
  reactionsEnabled: boolean;
  inputPosition: InputPosition;
  defaultCommentOrder: CommentOrder;
  onMetadata?: (metadata: DiscussionMetadata) => void;
}

export function CommentSection({
  provider,
  repo,
  repoId,
  categoryId,
  term,
  number,
  category,
  strict,
  reactionsEnabled,
  inputPosition,
  defaultCommentOrder,
  onMetadata,
}: CommentSectionProps) {
  const { isAuthenticated } = useAuth();
  const [commentOrder, setCommentOrder] =
    useState<CommentOrder>(defaultCommentOrder);

  const {
    viewer,
    discussion,
    comments,
    error,
    isLoading,
    isNotFound,
    hasMore,
    numHidden,
    addNewComment,
    addNewReply,
    toggleDiscussionReaction,
    toggleCommentReaction,
    toggleReplyReaction,
    mutate,
  } = useDiscussion({
    provider,
    params: { repo, term, number, category, strict },
    commentOrder,
  });

  // Emit metadata
  useEffect(() => {
    if (discussion && onMetadata) {
      onMetadata({
        id: discussion.id,
        url: discussion.url,
        locked: discussion.locked,
        reactionCount: discussion.reactionGroups.reduce(
          (sum, g) => sum + g.count,
          0
        ),
        totalCommentCount: discussion.totalCommentCount,
        totalReplyCount: discussion.totalReplyCount,
      });
    }
  }, [discussion, onMetadata]);

  const handleNewComment = useCallback(
    async (body: string) => {
      if (!discussion) {
        // Create discussion first if it doesn't exist
        const { id: discussionId } = await provider.createDiscussion({
          repositoryId: repoId,
          categoryId,
          title: term || `Comments for ${number}`,
          body: strict
            ? `<!-- agora-strict -->\n\nComments for this page.`
            : "Comments for this page.",
        });
        // Re-fetch to get the new discussion
        mutate();
        // Then add the comment
        const comment = await provider.addComment({
          discussionId,
          body,
        });
        addNewComment(comment);
      } else {
        const comment = await provider.addComment({
          discussionId: discussion.id,
          body,
        });
        addNewComment(comment);
      }
    },
    [
      discussion,
      provider,
      repoId,
      categoryId,
      term,
      number,
      strict,
      mutate,
      addNewComment,
    ]
  );

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[var(--agora-border)] p-6 text-center">
        <p className="text-sm text-[var(--agora-text-secondary)]">
          Failed to load comments.
        </p>
        <button
          onClick={() => mutate()}
          className="mt-2 text-sm text-[var(--agora-text-link)] hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Discussion-level reactions */}
      {reactionsEnabled && discussion && (
        <div className="mb-4">
          <ReactionButtons
            reactionGroups={discussion.reactionGroups}
            onToggle={toggleDiscussionReaction}
          />
        </div>
      )}

      {/* Header: comment count + sort */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--agora-text)]">
          {discussion
            ? `${discussion.totalCommentCount} comment${discussion.totalCommentCount === 1 ? "" : "s"}`
            : "No comments yet"}
        </h3>
        {comments.length > 1 && (
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setCommentOrder("oldest")}
              className={`px-2 py-1 rounded ${
                commentOrder === "oldest"
                  ? "bg-[var(--agora-bg-tertiary)] text-[var(--agora-text)] font-medium"
                  : "text-[var(--agora-text-secondary)] hover:text-[var(--agora-text)]"
              }`}
            >
              Oldest
            </button>
            <button
              onClick={() => setCommentOrder("newest")}
              className={`px-2 py-1 rounded ${
                commentOrder === "newest"
                  ? "bg-[var(--agora-bg-tertiary)] text-[var(--agora-text)] font-medium"
                  : "text-[var(--agora-text-secondary)] hover:text-[var(--agora-text)]"
              }`}
            >
              Newest
            </button>
          </div>
        )}
      </div>

      {/* Comment input (top position) */}
      {inputPosition === "top" && (
        <div className="mb-4">
          <CommentBox onSubmit={handleNewComment} />
        </div>
      )}

      {/* Comments list */}
      <div>
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            discussionId={discussion?.id ?? ""}
            provider={provider}
            onToggleReaction={toggleCommentReaction}
            onToggleReplyReaction={toggleReplyReaction}
            onNewReply={addNewReply}
          />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        numHidden={numHidden}
        hasMore={hasMore}
        isLoading={false}
        onLoadMore={() => {
          /* TODO: implement pagination with useSWRInfinite */
        }}
      />

      {/* Comment input (bottom position) */}
      {inputPosition === "bottom" && (
        <div className="mt-4">
          <CommentBox onSubmit={handleNewComment} />
        </div>
      )}

      {/* Powered by footer */}
      <div className="mt-4 text-center">
        <span className="text-xs text-[var(--agora-text-secondary)]">
          Powered by{" "}
          <a
            href="https://github.com/anthropics/agora"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--agora-text-link)] hover:underline"
          >
            Agora
          </a>
          {" "}&amp;{" "}
          <a
            href={discussion?.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--agora-text-link)] hover:underline"
          >
            GitHub Discussions
          </a>
        </span>
      </div>
    </div>
  );
}
