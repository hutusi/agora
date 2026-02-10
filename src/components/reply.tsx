"use client";

import type { IReply, ReactionContent } from "@/lib/types/adapter";
import { ReactionButtons } from "./reaction-buttons";

interface ReplyProps {
  reply: IReply;
  onToggleReaction: (replyId: string, reaction: ReactionContent) => void;
}

export function Reply({ reply, onToggleReaction }: ReplyProps) {
  if (reply.deletedAt || reply.isMinimized) {
    return (
      <div className="py-3 text-sm text-[var(--agora-text-secondary)] italic">
        This reply was hidden.
      </div>
    );
  }

  return (
    <div className="flex gap-3 py-3">
      {/* Avatar */}
      <a href={reply.author.url} target="_blank" rel="noopener noreferrer">
        <img
          src={reply.author.avatarUrl}
          alt={reply.author.login}
          className="w-6 h-6 rounded-full border border-[var(--agora-avatar-border)]"
          loading="lazy"
        />
      </a>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm">
          <a
            href={reply.author.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--agora-text)] hover:underline"
          >
            {reply.author.login}
          </a>
          {reply.authorAssociation !== "NONE" && (
            <span className="rounded-full border border-[var(--agora-border)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--agora-text-secondary)] leading-none">
              {reply.authorAssociation.toLowerCase()}
            </span>
          )}
          <a
            href={reply.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--agora-text-secondary)] hover:underline"
          >
            {formatTimeAgo(reply.createdAt)}
          </a>
          {reply.lastEditedAt && (
            <span className="text-xs text-[var(--agora-text-secondary)]">
              (edited)
            </span>
          )}
        </div>

        {/* Body */}
        <div
          className="agora-markdown mt-1 text-sm text-[var(--agora-text)]"
          dangerouslySetInnerHTML={{ __html: reply.bodyHTML }}
        />

        {/* Reactions */}
        <div className="mt-2">
          <ReactionButtons
            reactionGroups={reply.reactionGroups}
            onToggle={(reaction) => onToggleReaction(reply.id, reaction)}
          />
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
