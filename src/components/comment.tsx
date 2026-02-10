"use client";

import { useState, useCallback } from "react";
import type { IComment, IReply, ReactionContent } from "@/lib/types/adapter";
import type { DiscussionProvider } from "@/lib/types/provider";
import { useAuth } from "@/lib/context/auth-context";
import { ReactionButtons } from "./reaction-buttons";
import { Reply } from "./reply";
import { CommentBox } from "./comment-box";

interface CommentProps {
  comment: IComment;
  discussionId: string;
  provider: DiscussionProvider;
  onToggleReaction: (commentId: string, reaction: ReactionContent) => void;
  onToggleReplyReaction: (
    commentId: string,
    replyId: string,
    reaction: ReactionContent
  ) => void;
  onNewReply: (commentId: string, reply: IReply) => void;
}

export function Comment({
  comment,
  discussionId,
  provider,
  onToggleReaction,
  onToggleReplyReaction,
  onNewReply,
}: CommentProps) {
  const { isAuthenticated } = useAuth();
  const [showReplyBox, setShowReplyBox] = useState(false);

  const handleReply = useCallback(
    async (body: string) => {
      const reply = await provider.addReply({
        discussionId,
        commentId: comment.id,
        body,
      });
      onNewReply(comment.id, reply);
      setShowReplyBox(false);
    },
    [provider, discussionId, comment.id, onNewReply]
  );

  if (comment.deletedAt || comment.isMinimized) {
    return (
      <div className="py-4 text-sm text-[var(--agora-text-secondary)] italic border-b border-[var(--agora-border)]">
        This comment was hidden.
      </div>
    );
  }

  return (
    <div className="border-b border-[var(--agora-border)] last:border-b-0">
      <div className="flex gap-3 py-4">
        {/* Avatar */}
        <a
          href={comment.author.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
        >
          <img
            src={comment.author.avatarUrl}
            alt={comment.author.login}
            className="w-10 h-10 rounded-full border border-[var(--agora-avatar-border)]"
            loading="lazy"
          />
        </a>

        <div className="flex-1 min-w-0">
          {/* Comment bubble */}
          <div className="rounded-lg border border-[var(--agora-border)]">
            {/* Header */}
            <div className="flex items-center gap-2 rounded-t-lg bg-[var(--agora-bg-secondary)] px-4 py-2 text-sm border-b border-[var(--agora-border)]">
              <a
                href={comment.author.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--agora-text)] hover:underline"
              >
                {comment.author.login}
              </a>
              {comment.authorAssociation !== "NONE" && (
                <span className="rounded-full border border-[var(--agora-border)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--agora-text-secondary)] leading-none">
                  {comment.authorAssociation.toLowerCase()}
                </span>
              )}
              <a
                href={comment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--agora-text-secondary)] hover:underline"
              >
                {formatTimeAgo(comment.createdAt)}
              </a>
              {comment.lastEditedAt && (
                <span className="text-xs text-[var(--agora-text-secondary)]">
                  (edited)
                </span>
              )}
            </div>

            {/* Body */}
            <div
              className="agora-markdown px-4 py-3 text-sm text-[var(--agora-text)]"
              dangerouslySetInnerHTML={{ __html: comment.bodyHTML }}
            />
          </div>

          {/* Reactions + Reply button */}
          <div className="mt-2 flex items-center gap-3">
            <ReactionButtons
              reactionGroups={comment.reactionGroups}
              onToggle={(reaction) => onToggleReaction(comment.id, reaction)}
            />
            {isAuthenticated && (
              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="text-xs text-[var(--agora-text-secondary)] hover:text-[var(--agora-text-link)]"
              >
                Reply
              </button>
            )}
          </div>

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-2 ml-2 border-l-2 border-[var(--agora-timeline-color)] pl-4">
              {comment.replies.map((reply) => (
                <Reply
                  key={reply.id}
                  reply={reply}
                  onToggleReaction={(replyId, reaction) =>
                    onToggleReplyReaction(comment.id, replyId, reaction)
                  }
                />
              ))}
            </div>
          )}

          {/* Reply box */}
          {showReplyBox && (
            <div className="mt-3">
              <CommentBox
                onSubmit={handleReply}
                placeholder="Write a reply..."
                submitLabel="Reply"
                compact
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return "just now";
}
